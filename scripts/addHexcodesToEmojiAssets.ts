#!/usr/bin/env ts-node

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();

type CompactSkin = {
    hexcode: string;
    unicode: string;
};

type CompactEntry = {
    hexcode: string;
    unicode: string;
    label?: string;
    skins?: CompactSkin[];
};

type IamcalShortcodes = Record<string, string | string[]>;

function stripVariationSelectors(glyph: string): string {
    return glyph.replaceAll('\uFE0F', '').replaceAll('\uFE0E', '');
}

function canonicalGlyph(glyph: string): string {
    return stripVariationSelectors(glyph.normalize('NFC'));
}

function loadJson<T>(relativeFromRoot: string): T {
    const full = path.join(ROOT, relativeFromRoot);
    return JSON.parse(fs.readFileSync(full, 'utf8')) as T;
}

function buildGlyphToHex(compact: CompactEntry[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const entry of compact) {
        const key = canonicalGlyph(entry.unicode);
        if (!map.has(key)) {
            map.set(key, entry.hexcode.toUpperCase());
        }
        for (const skin of entry.skins ?? []) {
            const skinKey = canonicalGlyph(skin.unicode);
            if (!map.has(skinKey)) {
                map.set(skinKey, skin.hexcode.toUpperCase());
            }
        }
    }
    return map;
}

function buildSlackNameToHex(iamcal: IamcalShortcodes): Map<string, string> {
    const map = new Map<string, string>();
    for (const [hexRaw, value] of Object.entries(iamcal)) {
        const hex = hexRaw.toUpperCase();
        const names = Array.isArray(value) ? value : [value];
        for (const name of names) {
            const existing = map.get(name);
            if (existing && existing !== hex) {
                process.stderr.write(`shortcode name collision for "${name}": keeping ${existing}, ignoring ${hex}\n`);
            } else if (!existing) {
                map.set(name, hex);
            }
        }
    }
    return map;
}

function normalizeHexDigits(value: string): string {
    return value.toUpperCase();
}

/** UTF-8 key as ASCII C++ literal with \\xHH escapes (used for emoji glyph keys). */
function cppEscapedUtf8Key(glyph: string): string {
    const bytes = [...Buffer.from(glyph, 'utf8')];
    const body = bytes.map((b) => `\\x${b.toString(16).padStart(2, '0').toUpperCase()}`).join('');
    return `"${body}"`;
}

function cppEscapedAsciiOrUtf8(key: string): string {
    if (/^[\x20-\x7E]+$/.test(key)) {
        return `"${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return cppEscapedUtf8Key(key);
}

function extractTypesLiterals(typesInner: string | undefined): string[] {
    if (!typesInner) {
        return [];
    }
    const out: string[] = [];
    const re = /'((?:[^'\\]|\\.)*)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(typesInner)) !== null) {
        out.push(m[1].replace(/\\'/g, "'"));
    }
    return out;
}

function stripEmojiHexcodes(source: string): string {
    return source.replace(/\r?\n\s*hexcode:\s*'[0-9A-Fa-f-]+',?/g, '');
}

function main(): void {
    const compact = loadJson<CompactEntry[]>(path.join('node_modules', 'emojibase-data', 'en', 'compact.json'));
    const iamcal = loadJson<IamcalShortcodes>(path.join('node_modules', 'emojibase-data', 'en', 'shortcodes', 'iamcal.json'));
    const glyphToHex = buildGlyphToHex(compact);
    const slackToHex = buildSlackNameToHex(iamcal);

    const commonPath = path.join(ROOT, 'assets', 'emojis', 'common.ts');
    let commonSource = fs.readFileSync(commonPath, 'utf8');
    commonSource = stripEmojiHexcodes(commonSource);

    const pickerBlock = /\{\s*\r?\n\s*name:\s*'([^']*)',\s*\r?\n\s*code:\s*'([^']*)'/g;
    type MatchInfo = {
        idx: number;
        insertAfter: number;
        name: string;
        code: string;
        typesInner?: string;
    };
    const blocks: MatchInfo[] = [];
    let m: RegExpExecArray | null;
    while ((m = pickerBlock.exec(commonSource)) !== null) {
        const name = m[1];
        const code = m[2];
        const insertAfter = m.index + m[0].length;
        const rest = commonSource.slice(insertAfter);
        const typesMatch = rest.match(/^\s*,\s*\r?\n\s*types:\s*\[([\s\S]*?)\]\s*,?/);
        const typesInner = typesMatch ? typesMatch[1] : undefined;
        blocks.push({idx: m.index, insertAfter, name, code, typesInner});
    }

    const cppEntries = new Map<string, string>();
    const resolveHex = (name: string, code: string): string | undefined => {
        const byGlyph = glyphToHex.get(canonicalGlyph(code));
        if (byGlyph) {
            return normalizeHexDigits(byGlyph);
        }
        const bySlack = slackToHex.get(name);
        if (bySlack) {
            return normalizeHexDigits(bySlack);
        }
        return undefined;
    };

    const addCpp = (key: string, hex: string) => {
        const h = normalizeHexDigits(hex);
        const prev = cppEntries.get(key);
        if (prev && prev !== h) {
            process.stderr.write(`Cpp map key conflict for ${key}: ${prev} vs ${h} (keeping first)\n`);
            return;
        }
        if (!prev) {
            cppEntries.set(key, h);
        }
    };

    const unmappable: string[] = [];

    for (const block of blocks) {
        const hex = resolveHex(block.name, block.code);
        if (!hex) {
            unmappable.push(block.name);
            continue;
        }
        addCpp(block.name, hex);
        addCpp(`:${block.name}:`, hex);
        addCpp(block.code, hex);
        for (const t of extractTypesLiterals(block.typesInner)) {
            const toneHex = glyphToHex.get(canonicalGlyph(t)) ?? hex;
            addCpp(t, toneHex);
        }
    }

    const globalCreateHex = normalizeHexDigits('E100');
    addCpp('global_create', globalCreateHex);
    addCpp(':global_create:', globalCreateHex);
    addCpp(String.fromCharCode(0xe100), globalCreateHex);

    const insertions: {pos: number; hex: string}[] = [];
    for (const block of blocks) {
        const hex = resolveHex(block.name, block.code);
        if (hex) {
            insertions.push({pos: block.insertAfter, hex: normalizeHexDigits(hex)});
        }
    }
    insertions.sort((a, b) => b.pos - a.pos);
    let updated = commonSource;
    for (const {pos, hex} of insertions) {
        updated = `${updated.slice(0, pos)},\n        hexcode: '${hex}'${updated.slice(pos)}`;
    }

    updated = updated.replace(/(\n\s*name: 'global_create',\s*\n\s*code: CONST\.CUSTOM_EMOJIS\.GLOBAL_CREATE,)(?!\s*\n\s*hexcode:)/, `$1\n        hexcode: '${globalCreateHex}',`);

    fs.writeFileSync(commonPath, updated);

    unmappable.sort();
    const uniqueUnmappable = [...new Set(unmappable)].sort();

    const headerLines: string[] = [
        '#pragma once',
        '#include <unordered_map>',
        '#include <string>',
        'using namespace std;',
        '',
        '// Generated by App/scripts/addHexcodesToEmojiAssets.ts.',
        '// Maps reaction strings Expensify has stored to canonical Unicode hexcode strings.',
        'namespace EmojiHexcodeMap {',
        'inline const unordered_map<string, string> map = {',
    ];

    const sortedKeys = [...cppEntries.keys()].sort((a, b) => {
        const as = cppEscapedAsciiOrUtf8(a);
        const bs = cppEscapedAsciiOrUtf8(b);
        return as.localeCompare(bs);
    });
    for (const key of sortedKeys) {
        const hex = cppEntries.get(key)!;
        const cppKey = cppEscapedAsciiOrUtf8(key);
        headerLines.push(`    {${cppKey}, "${hex}"},`);
    }
    headerLines.push('};', '}', '');
    const outDir = path.join(ROOT, 'scripts', 'generated');
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, 'EmojiHexcodeMap.h'), headerLines.join('\n'));

    for (const n of uniqueUnmappable) {
        process.stderr.write(`unmapped emoji picker entry: "${n}" (no glyph or iamcal slack match)\n`);
    }

    console.log(`Wrote hexcode fields (${blocks.length - uniqueUnmappable.length}/${blocks.length} mapped) and EmojiHexcodeMap.h (${cppEntries.size} keys)`);
}

main();
