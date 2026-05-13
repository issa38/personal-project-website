import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const publishEntries = [
  "_headers",
  "CNAME",
  "assets",
  "dcf-model.html",
  "index.html",
  "robots.txt",
  "scripts",
  "sitemap.xml",
  "styles.css",
];

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

for (const entry of publishEntries) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

console.log(`Built static site in ${dist}`);
