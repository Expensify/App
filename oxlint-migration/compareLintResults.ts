/**
 * Compare ESLint vs oxlint JSON outputs on the same file subset.
 *
 * Usage: bun compareLintResults.ts <eslint.json> <oxlint.json> [--out <dir>]
 *
 * ESLint format: Array<{filePath, messages: Array<{ruleId, line, column, message, severity}>}>
 * Oxlint format (--format json): {diagnostics: Array<{filename, code, message, labels|spans...}>}
 *   (oxlint's exact JSON shape varies by version; adjust extractOxlint below after first run)
 */

type Finding = {
    file: string;
    line: number;
    rule: string;
    message: string;
};

const REPO_ROOT_MARKER = 'Expensify-App-w2/';

function relPath(p: string): string {
    const idx = p.indexOf(REPO_ROOT_MARKER);
    return idx >= 0 ? p.slice(idx + REPO_ROOT_MARKER.length) : p;
}

/** Normalize rule ids from both tools to `plugin/rule` or bare `rule`. */
function normalizeRule(rule: string | null | undefined): string {
    if (!rule) {
        return '(parse-or-fatal)';
    }
    let r = rule.trim();
    // oxlint styles seen across versions: "eslint(no-empty)", "typescript-eslint(no-unused-vars)",
    // "react/jsx-key", "eslint-plugin-react(jsx-key)"
    const parenMatch = r.match(/^([\w@/-]+)\((.+)\)$/);
    if (parenMatch) {
        const scope = parenMatch[1].replace(/^eslint-plugin-/, '');
        r = scope === 'eslint' ? parenMatch[2] : `${scope}/${parenMatch[2]}`;
    }
    // unify typescript-eslint naming
    r = r.replace(/^@typescript-eslint\//, 'typescript/').replace(/^typescript-eslint\//, 'typescript/');
    return r;
}

function extractESLint(json: unknown): Finding[] {
    const results = json as Array<{filePath: string; messages: Array<{ruleId: string | null; line?: number; message: string}>}>;
    return results.flatMap((res) =>
        res.messages.map((m) => ({
            file: relPath(res.filePath),
            line: m.line ?? 0,
            rule: normalizeRule(m.ruleId),
            message: m.message,
        })),
    );
}

function extractOxlint(json: unknown): Finding[] {
    // Try the documented shape first; fall back to raw array.
    const root = json as Record<string, unknown>;
    const diagnostics = (Array.isArray(root) ? root : (root.diagnostics ?? root.messages)) as Array<Record<string, unknown>> | undefined;
    if (!diagnostics) {
        throw new Error(`Unrecognized oxlint JSON shape. Top-level keys: ${Object.keys(root).join(', ')}`);
    }
    return diagnostics.map((d) => {
        const labels = d.labels as Array<{span?: {line?: number}; line?: number}> | undefined;
        const line = (d.line as number | undefined) ?? labels?.[0]?.span?.line ?? labels?.[0]?.line ?? 0;
        return {
            file: relPath((d.filename as string) ?? (d.file as string) ?? ''),
            line,
            rule: normalizeRule((d.code as string) ?? (d.rule as string)),
            message: (d.message as string) ?? '',
        };
    });
}

function key(f: Finding): string {
    // line-tolerant key first pass: file + rule (line numbers can drift on multi-span rules).
    return `${f.file}::${f.rule}`;
}

function exactKey(f: Finding): string {
    return `${f.file}::${f.line}::${f.rule}`;
}

function countBy<T>(items: T[], fn: (t: T) => string): Map<string, number> {
    const m = new Map<string, number>();
    for (const it of items) {
        const k = fn(it);
        m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
}

function printTop(title: string, counts: Map<string, number>, limit = 30) {
    console.log(`\n## ${title}`);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
    for (const [rule, n] of sorted) {
        console.log(`${String(n).padStart(6)}  ${rule}`);
    }
}

const [eslintPath, oxlintPath] = process.argv.slice(2);
if (!eslintPath || !oxlintPath) {
    console.error('Usage: bun compareLintResults.ts <eslint.json> <oxlint.json>');
    process.exit(1);
}

const eslintFindings = extractESLint(await Bun.file(eslintPath).json());
const oxlintFindings = extractOxlint(await Bun.file(oxlintPath).json());

console.log(`ESLint findings: ${eslintFindings.length}`);
console.log(`Oxlint findings: ${oxlintFindings.length}`);

const oxExact = new Set(oxlintFindings.map(exactKey));
const oxLoose = new Set(oxlintFindings.map(key));
const esExact = new Set(eslintFindings.map(exactKey));
const esLoose = new Set(eslintFindings.map(key));

const bothExact = eslintFindings.filter((f) => oxExact.has(exactKey(f)));
const eslintOnly = eslintFindings.filter((f) => !oxLoose.has(key(f)));
const oxlintOnly = oxlintFindings.filter((f) => !esLoose.has(key(f)));

console.log(`\nParity (exact file:line:rule): ${bothExact.length}`);
console.log(`ESLint-only (loose file:rule): ${eslintOnly.length}`);
console.log(`Oxlint-only (loose file:rule): ${oxlintOnly.length}`);

printTop(
    'ESLint-only by rule (oxlint coverage gaps)',
    countBy(eslintOnly, (f) => f.rule),
);
printTop(
    'Oxlint-only by rule (new catches or false positives)',
    countBy(oxlintOnly, (f) => f.rule),
);
printTop(
    'ESLint findings by rule (all)',
    countBy(eslintFindings, (f) => f.rule),
);
printTop(
    'Oxlint findings by rule (all)',
    countBy(oxlintFindings, (f) => f.rule),
);

// Dump full bucket details for the report
const outDir = eslintPath.replace(/[^/]+$/, '');
await Bun.write(`${outDir}bucket-eslint-only.json`, JSON.stringify(eslintOnly, null, 2));
await Bun.write(`${outDir}bucket-oxlint-only.json`, JSON.stringify(oxlintOnly, null, 2));
console.log(`\nDetail dumps: ${outDir}bucket-eslint-only.json, ${outDir}bucket-oxlint-only.json`);
