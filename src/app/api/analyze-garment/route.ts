import { NextRequest, NextResponse } from "next/server";
import {
  analyzeGarmentImage,
  generateHeuristicFallback,
  validateUploadPayload,
  PRESET_ANALYSES,
} from "@/lib/ai-garment";

export async function GET() {
  return NextResponse.json({
    success: true,
    presets: Object.keys(PRESET_ANALYSES),
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let base64 = "";
    let mimeType = "image/jpeg";
    let preset: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const presetField = formData.get("preset");
      if (presetField) preset = String(presetField);

      if (file && file.size > 0) {
        // Validate file size and MIME type
        const uploadValidation = validateUploadPayload({
          size: file.size,
          mimeType: file.type,
        });

        if (!uploadValidation.valid) {
          return NextResponse.json(
            { error: uploadValidation.error },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64 = buffer.toString("base64");
        mimeType = file.type || "image/jpeg";
      }
    } else {
      // JSON body
      const body = await req.json().catch(() => ({}));
      preset = body.preset;

      if (body.image) {
        base64 = String(body.image);
        mimeType = body.mimeType || "image/jpeg";
      } else if (body.base64) {
        base64 = String(body.base64);
        mimeType = body.mimeType || "image/jpeg";
      }

      if (base64) {
        // Approximate byte size of base64
        const estimatedSize = Math.ceil((base64.length * 3) / 4);
        const uploadValidation = validateUploadPayload({
          size: estimatedSize,
          mimeType,
        });

        if (!uploadValidation.valid) {
          return NextResponse.json(
            { error: uploadValidation.error },
            { status: 400 }
          );
        }
      }
    }

    // If neither base64 nor preset provided
    if (!base64 && !preset) {
      return NextResponse.json(
        { error: "هیچ فایلی ارسال نشده است" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const analysis = await analyzeGarmentImage(apiKey, {
      base64,
      mimeType,
      preset,
    });

    return NextResponse.json({
      success: true,
      source: analysis.source,
      data: analysis.result,
    });
  } catch (err: any) {
    console.error("POST /api/analyze-garment error:", err);
    // Graceful fallback on unexpected error
    const fallback = generateHeuristicFallback("trench_coat");
    return NextResponse.json({
      success: true,
      source: "HEURISTIC_FALLBACK",
      data: fallback,
      warning: "خطای پردازش تصویر، اطلاعات با استفاده از الگوریتم جایگزین استخراج شد",
    });
  }
}
