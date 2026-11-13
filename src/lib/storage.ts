import fs from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;
  pathname: string;
  size?: number;
  contentType?: string;
}

export interface StorageAdapter {
  upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult>;
  delete(urlOrPathname: string): Promise<boolean>;
  get(pathname: string): Promise<Buffer | null>;
  getUrl(pathname: string): string;
}

/**
 * Sanitizes filename to prevent directory traversal and remove unsupported characters.
 */
function sanitizeFilename(filename: string): string {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Converts File, Buffer, or Uint8Array into a Node.js Buffer.
 */
async function toBuffer(file: File | Buffer | Uint8Array): Promise<Buffer> {
  if (Buffer.isBuffer(file)) {
    return file;
  }
  if (file instanceof Uint8Array) {
    return Buffer.from(file);
  }
  if (typeof (file as File).arrayBuffer === "function") {
    const arrayBuffer = await (file as File).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error("نوع فایل پشتیبانی نمی‌شود.");
}

/**
 * Vercel Blob Storage Implementation (Production Cloud Storage).
 */
class VercelBlobStorageAdapter implements StorageAdapter {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult> {
    const buffer = await toBuffer(file);
    const sanitized = sanitizeFilename(filename);
    const folder = options?.folder ? options.folder.replace(/^\/+|\/+$/g, "") : "general";
    const pathname = `${folder}/${Date.now()}-${sanitized}`;

    // Dynamic import to prevent crash when @vercel/blob is unneeded
    // @ts-ignore
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, buffer, {
      access: "public",
      token: this.token,
      contentType: options?.contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: buffer.length,
      contentType: options?.contentType,
    };
  }

  async delete(urlOrPathname: string): Promise<boolean> {
    try {
      // @ts-ignore
      const { del } = await import("@vercel/blob");
      await del(urlOrPathname, { token: this.token });
      return true;
    } catch (error) {
      console.error("Vercel Blob deletion error:", error);
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer | null> {
    try {
      const url = this.getUrl(pathname);
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }

  getUrl(pathname: string): string {
    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
      return pathname;
    }
    return pathname;
  }
}

/**
 * Local Filesystem Storage Implementation (Development Fallback).
 * Saves files under <root>/public/uploads/${folder}/${filename}
 */
class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
  }

  async upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult> {
    const buffer = await toBuffer(file);
    const sanitized = sanitizeFilename(filename);
    const folder = options?.folder ? options.folder.replace(/^\/+|\/+$/g, "") : "general";
    const targetDir = path.join(this.baseDir, folder);

    await fs.mkdir(targetDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${sanitized}`;
    const filePath = path.join(targetDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${folder}/${uniqueFilename}`;
    return {
      url: relativeUrl,
      pathname: `${folder}/${uniqueFilename}`,
      size: buffer.length,
      contentType: options?.contentType,
    };
  }

  async delete(urlOrPathname: string): Promise<boolean> {
    try {
      const cleanPath = urlOrPathname.replace(/^\/uploads\//, "");
      const fullPath = path.join(this.baseDir, cleanPath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      // Ignore if file already deleted
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer | null> {
    try {
      const cleanPath = pathname.replace(/^\/uploads\//, "");
      const fullPath = path.join(this.baseDir, cleanPath);
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  getUrl(pathname: string): string {
    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
      return pathname;
    }
    const cleanPath = pathname.replace(/^\/uploads\//, "");
    return `/uploads/${cleanPath}`;
  }
}

/**
 * Storage singleton: chooses Vercel Blob if BLOB_READ_WRITE_TOKEN is set,
 * otherwise transparently falls back to local disk storage in public/uploads.
 */
function createStorageAdapter(): StorageAdapter {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && token.trim().length > 0) {
    return new VercelBlobStorageAdapter(token.trim());
  }
  return new LocalStorageAdapter();
}

export const storage = createStorageAdapter();

export async function uploadFile(
  file: File | Buffer | Uint8Array,
  filename: string,
  options?: { folder?: string; contentType?: string }
): Promise<UploadResult> {
  return storage.upload(file, filename, options);
}

export async function deleteFile(urlOrPathname: string): Promise<boolean> {
  return storage.delete(urlOrPathname);
}

export async function getFile(pathname: string): Promise<Buffer | null> {
  return storage.get(pathname);
}
