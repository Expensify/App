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
 */
import {$} from 'bun';
import CLI from 'expensify-common/CLI';
import {readdirSync} from 'fs';
import path from 'path';

const projectRoot = `${import.meta.dir}/..`;

// typescript-eslint still needs the TypeScript 6 compiler API, so it requires `@typescript/typescript6`
// (see the patches under patches/@typescript-eslint/). The root `typescript` package is TypeScript 7.
// Invoke that bin by path so a leftover `.bin/tsc` from `@typescript/old` cannot win.
const tsc = `${projectRoot}/node_modules/typescript/bin/tsc`;

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

/** Type-check one project. Build mode skips it entirely when its build info file is already current. */
async function typecheckProject(project: string) {
    const result = await $`${tsc} --build ${project}`.cwd(projectRoot).quiet().nothrow();
    return {project, result};
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
const results = await Promise.all(projects.map(typecheckProject));

const failed: string[] = [];
for (const {project, result} of results) {
    console.log(`\nType checking ${project}...`);
    const output = `${result.stdout.toString()}${result.stderr.toString()}`.trim();
    if (output) {
        console.log(output);
    }
    if (result.exitCode !== 0) {
        failed.push(project);
    }
}

if (failed.length > 0) {
    console.error(`\nType checking failed for: ${failed.join(', ')}`);
    process.exit(1);
}

console.log('\nType checking passed.');
