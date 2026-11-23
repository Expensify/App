#!/usr/bin/env bun

/**
 * Type-check the repo with the TypeScript 7 native compiler.
 *
 *   bun scripts/typecheck.ts                   -> check every project the root solution references
 *   bun scripts/typecheck.ts tsconfig.bun.json -> check just the named project
 *
 * The project list comes from the `references` in the root `tsconfig.json`, so a project joins CI by
 * being referenced there and nowhere else.
 *
 * Every project is checked even after one fails, so a single run reports every error in the repo.
 * Projects are checked concurrently, which is why this fans out `tsc --build` per project instead of
 * running `tsc --build tsconfig.json` once: build mode walks a solution sequentially.
 *
 * Every project must have 0 errors, except the native app project, which is compared with a per-file
 * baseline of known errors (see scripts/utils/TypecheckBaseline.ts) and must never load the DOM lib.
 *
 *   TYPECHECK_BASELINE_UPDATE=1 bun scripts/typecheck.ts -> rewrite the native baseline to the current errors
 */
import {$} from 'bun';
import CLI from 'expensify-common/CLI';
import {readdirSync} from 'fs';
import path from 'path';

import findDomLibraries from './utils/findDomLibraries';
import TypecheckBaseline from './utils/TypecheckBaseline';

const projectRoot = `${import.meta.dir}/..`;

// typescript-eslint still needs the TypeScript 6 compiler API, so it requires `@typescript/typescript6`
// (see the patches under patches/@typescript-eslint/). The root `typescript` package is TypeScript 7.
// Invoke that bin by path so a leftover `.bin/tsc` from `@typescript/old` cannot win.
const tsc = `${projectRoot}/node_modules/typescript/bin/tsc`;

const NATIVE_PROJECT = 'tsconfig.app.native.json';
const NATIVE_BASELINE_PATH = 'config/typescript/native-baseline.tsv';
const UPDATE_BASELINE_COMMAND = 'TYPECHECK_BASELINE_UPDATE=1 npm run typecheck';

type ProjectOutcome = {
    passed: boolean;
    output: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/** `Array.isArray` narrows to `any[]`, which loses the `unknown` we are trying to validate. */
function isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * Pull the `references[].path` list out of a `tsc --showConfig` payload.
 *
 * Every entry is validated rather than filtered: silently dropping a malformed reference would
 * silently drop a project out of the typecheck gate.
 */
function readReferencePaths(config: unknown): string[] {
    if (!isRecord(config) || !isUnknownArray(config.references)) {
        throw new Error('tsconfig.json has no `references` array, so there is nothing to type-check.');
    }
    return config.references.map((reference, index) => {
        if (!isRecord(reference) || typeof reference.path !== 'string' || reference.path === '') {
            throw new Error(`tsconfig.json is malformed at references[${index}]: every reference needs a non-empty string "path".`);
        }
        return reference.path;
    });
}

/**
 * The projects the root solution references, relative to the repo root.
 *
 * `--showConfig` is how we read them: the root config carries comments, so it is not plain JSON, and
 * TypeScript 7 does not yet expose a compiler API we could parse it with.
 */
async function getReferencedProjects(): Promise<string[]> {
    const result = await $`${tsc} -p tsconfig.json --showConfig`.cwd(projectRoot).quiet().nothrow();
    if (result.exitCode !== 0) {
        throw new Error(`Could not read the projects referenced by tsconfig.json:\n${result.stderr.toString()}`);
    }
    const references = readReferencePaths(JSON.parse(result.stdout.toString()));
    if (references.length === 0) {
        throw new Error('tsconfig.json references no projects, so there is nothing to type-check.');
    }
    assertEveryRootProjectIsReferenced(references);
    return references;
}

/**
 * Fail loudly when a root-level project is missing from `tsconfig.json`'s `references`.
 *
 * `tsc --showConfig` drops a malformed reference (say, a misspelled `path` key) without reporting
 * anything, which would quietly take that project out of the typecheck gate. This turns both that
 * and "added a project but forgot to reference it" into an error.
 */
function assertEveryRootProjectIsReferenced(references: string[]) {
    const referenced = new Set(references.map((reference) => path.basename(reference)));
    const unreferenced = readdirSync(projectRoot)
        // `tsconfig.base.json` holds shared options rather than files, so it is not a project.
        .filter((entry) => /^tsconfig\..+\.json$/.test(entry) && entry !== 'tsconfig.base.json')
        .filter((entry) => !referenced.has(entry));
    if (unreferenced.length > 0) {
        throw new Error(`These projects are not referenced by tsconfig.json, so nothing type-checks them: ${unreferenced.join(', ')}`);
    }
}

function pluralize(count: number, noun: string): string {
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function isNativeProject(project: string): boolean {
    return path.normalize(project) === NATIVE_PROJECT;
}

/**
 * Compare the native project's errors with the checked-in baseline.
 *
 * Only errors in files over their recorded count are printed: the known ones would bury the new ones.
 * Lower counts are written back only in CI, so the `main` run can commit them, the same way the lint
 * seatbelt is tightened (contributingGuides/LINTING.md#seatbelt). Locally the worktree stays clean.
 */
async function checkNativeBaseline(output: string, exitCode: number): Promise<ProjectOutcome> {
    const {errorsByFile, unlocatedErrors} = TypecheckBaseline.parseErrors(output);
    const counts = TypecheckBaseline.countErrors(errorsByFile);
    const totalErrors = [...counts.values()].reduce((sum, count) => sum + count, 0);

    // A non-zero exit without a single error we can read means tsc itself failed, so show everything it printed.
    if (unlocatedErrors.length > 0 || (exitCode !== 0 && totalErrors === 0)) {
        return {passed: false, output};
    }

    const baselineFile = Bun.file(`${projectRoot}/${NATIVE_BASELINE_PATH}`);
    if (process.env.TYPECHECK_BASELINE_UPDATE) {
        await Bun.write(baselineFile, TypecheckBaseline.serializeBaseline(counts));
        return {passed: true, output: `Rewrote ${NATIVE_BASELINE_PATH}: ${pluralize(totalErrors, 'known error')} in ${pluralize(counts.size, 'file')}. Commit it with your change.`};
    }
    if (!(await baselineFile.exists())) {
        return {passed: false, output: `${NATIVE_BASELINE_PATH} is missing. Run \`${UPDATE_BASELINE_COMMAND}\` to create it.`};
    }

    const baseline = TypecheckBaseline.parseBaseline(await baselineFile.text());
    const {exceeded, improved} = TypecheckBaseline.compareWithBaseline(counts, baseline);
    const lines: string[] = [];

    if (exceeded.length > 0) {
        lines.push(
            ...exceeded.flatMap(({file}) => errorsByFile.get(file) ?? []),
            '',
            `These files have more native type errors than ${NATIVE_BASELINE_PATH} allows:`,
            ...exceeded.map(({file, count, allowed}) => `    ${file}: ${pluralize(count, 'error')}, ${allowed} allowed`),
            '',
            'Fix the new errors. If you moved or renamed a file that already had errors, run',
            `\`${UPDATE_BASELINE_COMMAND}\` and commit the baseline with your change.`,
        );
    }

    if (improved.length > 0) {
        if (process.env.CI) {
            await Bun.write(baselineFile, TypecheckBaseline.serializeBaseline(TypecheckBaseline.tightenBaseline(baseline, counts)));
            lines.push(`Tightened ${NATIVE_BASELINE_PATH} for ${pluralize(improved.length, 'file')} with fewer errors.`);
        } else {
            lines.push(
                `${pluralize(improved.length, 'file')} with fewer native type errors than ${NATIVE_BASELINE_PATH} records.`,
                `The baseline is tightened automatically on main after merge; to do it now, run \`${UPDATE_BASELINE_COMMAND}\`.`,
            );
        }
    }

    if (exceeded.length === 0) {
        lines.push(`${pluralize(totalErrors, 'known native type error')} in ${pluralize(counts.size, 'file')}, all within the baseline.`);
    }

    return {passed: exceeded.length === 0, output: lines.join('\n')};
}

/**
 * Fail when the native project loads the DOM lib.
 *
 * A dependency's `/// <reference lib="dom" />` makes every DOM global type-check in native code without a single error
 * to show for it, so the baseline can't catch it. `--listFilesOnly` skips type-checking, which keeps this to about a second.
 */
async function checkNativeDomLibraries(): Promise<ProjectOutcome> {
    const result = await $`${tsc} -p ${NATIVE_PROJECT} --listFilesOnly --explainFiles`.cwd(projectRoot).quiet().nothrow();
    const output = `${result.stdout.toString()}${result.stderr.toString()}`;
    if (result.exitCode !== 0) {
        return {passed: false, output: `Could not list the files in ${NATIVE_PROJECT}:\n${output}`};
    }

    const domLibraries = findDomLibraries(output);
    if (domLibraries.length === 0) {
        return {passed: true, output: ''};
    }
    return {
        passed: false,
        output: [
            `${NATIVE_PROJECT} loads the DOM lib, so DOM globals would type-check in native code:`,
            ...domLibraries.flatMap(({file, reasons}) => [`    ${file}`, ...reasons.map((reason) => `        ${reason}`)]),
            'Remove the reference, or patch the dependency that adds it.',
        ].join('\n'),
    };
}

/** Type-check one project. Build mode skips it entirely when its build info file is already current, and still reports its errors. */
async function typecheckProject(project: string): Promise<ProjectOutcome> {
    const result = await $`${tsc} --build ${project}`.cwd(projectRoot).quiet().nothrow();
    const output = `${result.stdout.toString()}${result.stderr.toString()}`.trim();
    if (isNativeProject(project)) {
        return checkNativeBaseline(output, result.exitCode);
    }
    return {passed: result.exitCode === 0, output};
}

const cli = new CLI({
    positionalArgs: [
        {
            name: 'projects',
            description: 'tsconfig paths to type-check, relative to the repo root',
            variadic: true,
            default: [],
        },
    ],
});

const projects = cli.positionalArgs.projects.length > 0 ? cli.positionalArgs.projects : await getReferencedProjects();

// All projects are checked concurrently. Projects share source files but each writes its own build
// info file (`tsBuildInfoFile`), so there is nothing for concurrent builds to race over.
// `--noEmit` lives in the configs because build mode rejects it as a flag.
const checks = projects.map(async (project) => ({name: project, outcome: await typecheckProject(project)}));
if (projects.some(isNativeProject)) {
    checks.push(checkNativeDomLibraries().then((outcome) => ({name: `${NATIVE_PROJECT} (DOM lib)`, outcome})));
}
const results = await Promise.all(checks);

const failed: string[] = [];
for (const {name, outcome} of results) {
    console.log(`\nType checking ${name}...`);
    if (outcome.output) {
        console.log(outcome.output);
    }
    if (!outcome.passed) {
        failed.push(name);
    }
}

if (failed.length > 0) {
    console.error(`\nType checking failed for: ${failed.join(', ')}`);
    process.exit(1);
}

console.log('\nType checking passed.');
