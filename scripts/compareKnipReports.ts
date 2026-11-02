import CLI from 'expensify-common/CLI';
import fs from 'fs';
import type {TupleToUnion} from 'type-fest';

/**
 * Knip (https://knip.dev) is a static analyzer that flags unused files, exports,
 * types, dependencies, and unlisted imports across the codebase. Project-specific
 * scope and ignores live in `knip.json`.
 *
 * This script compares two knip JSON reports (main vs PR) and exits 1 if the PR
 * introduces any new finding that isn't present on main — even when the PR also
 * resolves others. Findings are matched per `<file>::<name>`, so a single file
 * with multiple unused items counts as one finding per item.
 *
 * Usage: ts-node scripts/compareKnipReports.ts --mainPath=<main.json> --prPath=<pr.json>
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
        throw new Error(`Knip report not found: ${filepath}`);
    }
    const raw = fs.readFileSync(filepath, 'utf8');
    if (!raw.trim()) {
        throw new Error(`Knip report is empty: ${filepath}`);
    }

    // knip writes a single top-level JSON object to stdout, but tooling around it
    // can prepend noise (npm-run script header, babel.config.js debug logs,
    // webpack-plugin warnings, etc.). The object can also be pretty-printed, so
    // we can't rely on a fixed token like `{"issues"`. Locate every `{` and try
    // to parse from there; accept the first slice that parses AND has an
    // `issues` array. Anything else is a hard failure — the CI should not
    // silently treat a malformed report as "no findings".
    let searchFrom = 0;
    let lastParseError: Error | undefined;
    while (true) {
        const braceIdx = raw.indexOf('{', searchFrom);
        if (braceIdx < 0) {
            break;
        }
        try {
            const parsed = JSON.parse(raw.slice(braceIdx)) as unknown;
            if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Report).issues)) {
                return parsed as Report;
            }
        } catch (e) {
            lastParseError = e as Error;
        }
        searchFrom = braceIdx + 1;
    }
    const detail = lastParseError ? `: ${lastParseError.message}` : '';
    throw new Error(`Failed to parse knip JSON report at ${filepath}${detail}`);
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

const cli = new CLI({
    namedArgs: {
        mainPath: {
            description: 'Path to the main knip report JSON file',
            required: true,
        },
        prPath: {
            description: 'Path to the PR knip report JSON file',
            required: true,
        },
    },
});

const {mainPath, prPath} = cli.namedArgs;

let mainFlat: Map<Category, Set<string>>;
let prFlat: Map<Category, Set<string>>;
try {
    mainFlat = flatten(parseReport(mainPath));
    prFlat = flatten(parseReport(prPath));
} catch (e) {
    console.log(`::error::Knip comparator could not read a report: ${(e as Error).message}`);
    process.exit(2);
}

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
    // Emit one annotation per new finding so GitHub surfaces them on the PR's Checks tab.
    // GitHub renders up to 10 annotations per step; remaining entries stay in the full log above.
    for (const [cat, items] of added) {
        for (const id of items) {
            const sepIdx = id.indexOf('::');
            const file = sepIdx > 0 ? id.slice(0, sepIdx) : '';
            const name = sepIdx > 0 ? id.slice(sepIdx + 2) : id;
            const attrs = file ? `file=${file},title=Knip` : 'title=Knip';
            console.log(`::error ${attrs}::[${cat}] ${name}`);
        }
    }
    console.log(`\n::error::PR introduces ${addedTotal} new knip finding(s) (resolved ${resolvedTotal}, delta ${delta >= 0 ? '+' : ''}${delta}).`);
    process.exit(1);
}

console.log('\nPR introduces no new knip findings.');
