/**
 * Generates the static letter-avatar PNG set.
 *
 * For every (colour scheme x letter) it composites the bundled glyph outline over a coloured
 * background and rasterises it from the vector at full resolution, so the output stays crisp at
 * any display size. Output mirrors the CDN path: avatars/generated/letter/{schemeKey}/{LETTER}.png
 *
 * Schemes come from src/libs/Avatars/letterAvatarPalette.ts and glyphs from the bundled workspace
 * SVGs, so the PNGs and the in-app render share one source.
 *
 * Run:    npx tsx scripts/generateLetterAvatars.ts [outputDir]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';

const GLYPH_DIR = path.resolve(__dirname, '../assets/images/avatars/workspace');

/** CDN images root. Defaults to the sibling Web-Static checkout; override with a path arg. */
const outputArg = process.argv.at(2);
const OUTPUT_DIR = outputArg ? path.resolve(process.cwd(), outputArg) : path.resolve(__dirname, '../../Web-Static/images');

/** Characters we render. Letters render uppercase in the path; digits are case-less. */
const CHARS = [...'0123456789abcdefghijklmnopqrstuvwxyz'];

/** Output size in pixels, matching the 400x400 default/preset avatars on the CDN. */
const AVATAR_PX = 400;

/** Pull the inner markup (the fill-inheriting <path>) out of a glyph SVG file. */
function glyphInner(svg: string): string {
    return svg
        .replace(/^[\s\S]*?<svg[^>]*>/, '')
        .replace(/<\/svg>\s*$/, '')
        .trim();
}

/** Compose a full avatar SVG at an explicit pixel size so sharp rasterises at that size. */
function composeSvg(inner: string, backgroundColor: string, fillColor: string, px: number): string {
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 80 80">` +
        `<rect width="80" height="80" fill="${backgroundColor}"/>` +
        `<g fill="${fillColor}">${inner}</g>` +
        `</svg>`
    );
}

async function main() {
    const glyphs = new Map<string, string>();
    for (const ch of CHARS) {
        const file = path.join(GLYPH_DIR, `default-avatar_${ch}.svg`);
        glyphs.set(ch, glyphInner(await fs.readFile(file, 'utf8')));
    }

    let written = 0;
    for (const {key, backgroundColor, fillColor} of LETTER_AVATAR_SCHEMES) {
        const dir = path.join(OUTPUT_DIR, 'avatars/generated/letter', key);
        await fs.mkdir(dir, {recursive: true});
        for (const ch of CHARS) {
            const inner = glyphs.get(ch) ?? '';
            const svg = composeSvg(inner, backgroundColor, fillColor, AVATAR_PX);
            await sharp(Buffer.from(svg))
                .png({compressionLevel: 9})
                .toFile(path.join(dir, `${ch.toUpperCase()}.png`));
            written++;
        }
    }
    console.log(`Wrote ${written} PNGs (${LETTER_AVATAR_SCHEMES.length} schemes x ${CHARS.length} chars) to ${OUTPUT_DIR}`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
