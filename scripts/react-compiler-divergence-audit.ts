#!/usr/bin/env bun
/**
 * React Compiler Divergence Audit
 *
 * Runs BOTH React Compilers (Babel via babel-plugin-react-compiler, OXC via oxc-transform)
 * over the source tree and reports every file where the two disagree on memoization.
 *
 * A file is "divergent" when exactly one compiler memoizes it (`compiled` XOR not-`compiled`).
 * Divergent files ship without memoization on one platform (web uses OXC, mobile/Jest use Babel),
 * which is the class of bug this audit exists to surface. The output is a work list for the
 * manual-memoization sweep, grouped by direction, and is reusable for verification afterwards.
 *
 * Usage:
 *   bun scripts/react-compiler-divergence-audit.ts [paths...] [--out <report.json>]
 *   bun scripts/react-compiler-divergence-audit.ts            # audits src/ by default
 */
import CLI from 'expensify-common/CLI';
import fs from 'fs';
import path from 'path';

// The explicit .mjs extension is required for Node/bun ESM resolution of this JS module.
// eslint-disable-next-line import/extensions
import {checkBothCompilers} from '../config/reactCompiler/checkBoth.mjs';
import FileUtils from './utils/FileUtils';
import {bold, error as logError, info as logInfo, note as logNote, success as logSuccess} from './utils/Logger';

type CompilerStatus = 'compiled' | 'failed' | 'no-components';

type FileResult = {
    file: string;
    babel: CompilerStatus;
    oxc: CompilerStatus;
    babelMemoized: boolean;
    oxcMemoized: boolean;
};

const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const DEFAULT_INPUTS = ['src'];

function isSkipped(file: string): boolean {
    return file.includes('/tests/') || file.includes('node_modules/');
}

/**
 * Direction of the memoization gap: which compiler memoized the file while the other did not.
 * The status of the non-memoizing compiler is included for context (e.g. `failed` vs `no-components`).
 */
function directionLabel(result: FileResult): string {
    if (result.babelMemoized) {
        return `babel memoized / oxc did NOT (oxc=${result.oxc})`;
    }
    return `oxc memoized / babel did NOT (babel=${result.babel})`;
}

function main(): void {
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'paths',
                description: 'File paths, directories, or glob patterns to audit (default: src)',
                variadic: true,
                default: DEFAULT_INPUTS,
            },
        ],
        namedArgs: {
            out: {
                description: 'Path to write the JSON report (default: react-compiler-divergence-report.json)',
                required: false,
                default: 'react-compiler-divergence-report.json',
            },
        },
        flags: {},
    });

    const inputs = cli.positionalArgs.paths;
    const {out} = cli.namedArgs;

    const files = FileUtils.resolveFilePaths(inputs.length > 0 ? inputs : DEFAULT_INPUTS, FILE_EXTENSIONS).filter((file) => !isSkipped(file));

    if (files.length === 0) {
        logError('No source files found to audit.');
        process.exit(1);
    }

    logInfo(`Auditing ${files.length} files with both React Compilers (Babel + OXC)...`);

    const divergent: FileResult[] = [];
    let checked = 0;

    for (const absolutePath of files) {
        const source = fs.readFileSync(absolutePath, 'utf8');
        const {babel, oxc, isDivergent} = checkBothCompilers(source, absolutePath);
        checked += 1;
        if (isDivergent) {
            divergent.push({
                file: path.relative(process.cwd(), absolutePath),
                babel: babel.status,
                oxc: oxc.status,
                babelMemoized: babel.memoized,
                oxcMemoized: oxc.memoized,
            });
        }
    }

    // Group by direction for a readable work list.
    const groups = new Map<string, FileResult[]>();
    for (const result of divergent) {
        const label = directionLabel(result);
        const bucket = groups.get(label) ?? [];
        bucket.push(result);
        groups.set(label, bucket);
    }

    console.log();
    bold(`React Compiler divergence: ${divergent.length} of ${checked} files disagree between Babel and OXC.`);
    console.log();

    for (const [label, bucket] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
        logInfo(`${label} (${bucket.length})`);
        for (const result of bucket.sort((a, b) => a.file.localeCompare(b.file))) {
            logNote(`  ${result.file}`);
        }
        console.log();
    }

    const report = {
        generatedAt: new Date().toISOString(),
        totalChecked: checked,
        totalDivergent: divergent.length,
        files: divergent.sort((a, b) => a.file.localeCompare(b.file)),
    };
    fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
    logSuccess(`Wrote report to ${out}`);
}

if (require.main === module) {
    main();
}
