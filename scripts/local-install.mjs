import fs from "fs";
import path from "path";
import pacote from "/opt/homebrew/lib/node_modules/npm/node_modules/pacote/lib/index.js";

const root = process.cwd();
const nm = path.join(root, "node_modules");
const binDir = path.join(nm, ".bin");
fs.mkdirSync(nm, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const allDirect = { ...pkg.dependencies, ...pkg.devDependencies };

const queue = [];
for (const [name, version] of Object.entries(allDirect)) {
  queue.push({ name, spec: `${name}@${version}`, isDirect: true });
}

const installed = new Map();

console.log("Starting offline dependency extraction from ~/.npm/_cacache...");

while (queue.length > 0) {
  const { name, spec } = queue.shift();
  if (installed.has(name)) continue;

  const dest = path.join(nm, ...name.split("/"));
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  try {
    await pacote.extract(spec, dest, {
      cache: "/Users/sotoon/.npm/_cacache",
      offline: true,
    });
    installed.set(name, spec);

    const subPkgFile = path.join(dest, "package.json");
    if (fs.existsSync(subPkgFile)) {
      const subPkg = JSON.parse(fs.readFileSync(subPkgFile, "utf8"));

      // Link binaries into node_modules/.bin
      if (subPkg.bin) {
        const bins = typeof subPkg.bin === "string" ? { [name.split("/").pop()]: subPkg.bin } : subPkg.bin;
        for (const [binName, binRelPath] of Object.entries(bins)) {
          const binTarget = path.resolve(dest, binRelPath);
          const binLink = path.join(binDir, binName);
          try {
            if (fs.existsSync(binLink)) fs.unlinkSync(binLink);
            fs.symlinkSync(binTarget, binLink);
            fs.chmodSync(binTarget, 0o755);
          } catch (e) {}
        }
      }

      // Enqueue subdependencies
      for (const [subDep, subVer] of Object.entries(subPkg.dependencies || {})) {
        if (!installed.has(subDep)) {
          queue.push({ name: subDep, spec: `${subDep}@${subVer}`, isDirect: false });
        }
      }
    }
  } catch (err) {
    // If optional/transitive dependency is missing from cache, log and continue
    console.warn(`[WARN] Could not extract ${spec}: ${err.message}`);
  }
}

console.log(`✅ Successfully extracted ${installed.size} packages into node_modules/`);
