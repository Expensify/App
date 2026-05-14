import fs from 'fs';
import type {TupleToUnion} from 'type-fest';

/**
 * Compare two knip JSON reports (main vs PR).
 * Exit 1 if the PR introduces any new finding that isn't present on main, regardless
 * of whether the PR also resolves others. Findings are matched per `<file>::<name>`,
 * so a single file with multiple unused items in the same category counts as one
 * finding per item.
 *
 * Usage: ts-node scripts/compareKnipReports.ts <main.json> <pr.json>
 */

const CATEGORIES = [
    'files',
    'dependencies',
    'devDependencies',
    'optionalPeerDependencies',
    'unlisted',
    'binaries',
    'unresolved',
    'exports',
    'types',
    'nsExports',
    'nsTypes',
    'enumMembers',
    'classMembers',
    'duplicates',
] as const;

type Category = TupleToUnion<typeof CATEGORIES>;

type IssueItem = string | {name?: string; symbol?: string};

type Entry = {
    file?: string;
} & Partial<Record<Category, IssueItem[]>>;

type Report = {
    issues?: Entry[];
};

function parseReport(filepath: string): Report {
    if (!fs.existsSync(filepath)) {
        return {issues: []};
    }
    let raw = fs.readFileSync(filepath, 'utf8');
    // knip writes JSON to stdout, but babel.config.js debug logs can prepend noise.
    // Trim everything before the first `{"issues"` token.
    const i = raw.indexOf('{"issues"');
    if (i > 0) {
        raw = raw.slice(i);
    }
    if (!raw.trim()) {
        return {issues: []};
    }
    try {
        return JSON.parse(raw) as Report;
    } catch (e) {
        console.error(`Failed to parse ${filepath}: ${(e as Error).message}`);
        return {issues: []};
    }
}

function flatten(report: Report): Map<Category, Set<string>> {
    const out = new Map<Category, Set<string>>();
    for (const cat of CATEGORIES) {
        out.set(cat, new Set<string>());
    }

    for (const entry of report.issues ?? []) {
        const file = entry.file ?? '';
        for (const cat of CATEGORIES) {
            const items = entry[cat];
            if (!Array.isArray(items)) {
                continue;
            }
            for (const item of items) {
                const name = typeof item === 'string' ? item : (item.symbol ?? item.name ?? JSON.stringify(item));
                out.get(cat)?.add(`${file}::${name}`);
            }
        }
    }
    return out;
}

function diff(mainMap: Map<Category, Set<string>>, prMap: Map<Category, Set<string>>): {added: Map<Category, string[]>; resolved: Map<Category, string[]>} {
    const added = new Map<Category, string[]>();
    const resolved = new Map<Category, string[]>();
    for (const cat of CATEGORIES) {
        const m = mainMap.get(cat) ?? new Set<string>();
        const p = prMap.get(cat) ?? new Set<string>();
        const a: string[] = [];
        const r: string[] = [];
        for (const x of p) {
            if (!m.has(x)) {
                a.push(x);
            }
        }
        for (const x of m) {
            if (!p.has(x)) {
                r.push(x);
            }
        }
        if (a.length) {
            added.set(cat, a.sort());
        }
        if (r.length) {
            resolved.set(cat, r.sort());
        }
    }
    return {added, resolved};
}

function totalCount(map: Map<Category, Set<string>>): number {
    let n = 0;
    for (const set of map.values()) {
        n += set.size;
    }
    return n;
}

function printSection(title: string, byCategory: Map<Category, string[]>): void {
    if (byCategory.size === 0) {
        return;
    }
    console.log(`\n${title}`);
    for (const [cat, items] of byCategory) {
        console.log(`  ${cat} (${items.length}):`);
        for (const it of items) {
            console.log(`    ${it}`);
        }
    }
}

const [mainPath, prPath] = process.argv.slice(2);
if (!mainPath || !prPath) {
    console.error('Usage: ts-node compareKnipReports.ts <main.json> <pr.json>');
    process.exit(2);
}

const mainFlat = flatten(parseReport(mainPath));
const prFlat = flatten(parseReport(prPath));

const mainTotal = totalCount(mainFlat);
const prTotal = totalCount(prFlat);
const delta = prTotal - mainTotal;
const {added, resolved} = diff(mainFlat, prFlat);
const addedTotal = [...added.values()].reduce((n, a) => n + a.length, 0);
const resolvedTotal = [...resolved.values()].reduce((n, a) => n + a.length, 0);

console.log('Knip comparison:');
console.log(`  main : ${mainTotal}`);
console.log(`  PR   : ${prTotal} (delta ${delta >= 0 ? '+' : ''}${delta})`);
console.log(`  added by PR    : ${addedTotal}`);
console.log(`  resolved by PR : ${resolvedTotal}`);

printSection('New issues introduced:', added);
printSection('Issues resolved:', resolved);

if (addedTotal > 0) {
    console.log(`\n::error::PR introduces ${addedTotal} new knip finding(s) (resolved ${resolvedTotal}, delta ${delta >= 0 ? '+' : ''}${delta}).`);
    process.exit(1);
}

console.log('\nPR introduces no new knip findings.');
