import { promises as fs } from "node:fs";
import path from "node:path";
import { favicons } from "favicons";

const root = process.cwd();
const source = path.join(root, "public", "icons", "brand-mark.svg");
const outDir = path.join(root, "public", "icons");

const response = await favicons(source, {
  path: "/icons",
  appName: "Me Chess Book",
  appShortName: "MCB",
  appDescription:
    "Turn your Lichess games into a printable chess book.",
  developerName: "HappyPaul55",
  background: "#0C0D0A",
  theme_color: "#0C0D0A",
  display: "standalone",
  orientation: "any",
  scope: "/",
  start_url: "/make",
  lang: "en-GB",
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: true,
    yandex: false,
  },
});

for (const image of response.images) {
  await fs.writeFile(path.join(outDir, image.name), image.contents);
}
for (const file of response.files) {
  await fs.writeFile(path.join(outDir, file.name), file.contents);
}

console.log(
  `Generated ${response.images.length} images and ${response.files.length} files in public/icons.`,
);
