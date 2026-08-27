#!/usr/bin/env bun

/**
 * Type-check the repo with the TypeScript 7 native compiler.
 *
 *   bun scripts/typecheck.ts              -> check every project CI gates on
 *   bun scripts/typecheck.ts tsconfig.bun.json -> check just the named project
 *
 * Every project is checked even after one fails, so a single run reports every error in the repo.
 */
import {$} from 'bun';
import CLI from 'expensify-common/CLI';

const projectRoot = `${import.meta.dir}/..`;

// typescript-eslint still needs the TypeScript 6 compiler API, so it requires `@typescript/typescript6`
// (see the patches under patches/@typescript-eslint/). The root `typescript` package is TypeScript 7.
// Invoke that bin by path so a leftover `.bin/tsc` from `@typescript/old` cannot win.
const tsc = `${projectRoot}/node_modules/typescript/bin/tsc`;

/** TypeScript projects, relative to the repo root, that `npm run typecheck` and CI check. */
const DEFAULT_PROJECTS = ['tsconfig.json', 'tsconfig.bun.json', 'tsconfig.node.json', 'server/victory-chart-renderer/tsconfig.json'];

const cli = new CLI({
    positionalArgs: [
        {
            name: 'projects',
            description: 'tsconfig paths to type-check, relative to the repo root',
            variadic: true,
            default: DEFAULT_PROJECTS,
        },
    ],
});

const {projects} = cli.positionalArgs;

const failed: string[] = [];
for (const project of projects) {
    const tsconfig = project.endsWith('.json') ? project : `${project}/tsconfig.json`;
    console.log(`\nType checking ${tsconfig}...`);

    // The build info file lets repeat runs skip unchanged projects. It is named apart from the
    // `tsconfig.tsbuildinfo` that `incremental` defaults to so that running TypeScript 6 by hand in
    // the same worktree can't feed it a build info file written by a different compiler.
    const tsBuildInfoFile = `${tsconfig.replace(/\.json$/, '')}.ts7.tsbuildinfo`;
    const result = await $`${tsc} --noEmit --incremental -p ${tsconfig} --tsBuildInfoFile ${tsBuildInfoFile}`.cwd(projectRoot).nothrow();
    if (result.exitCode !== 0) {
        failed.push(tsconfig);
    }
}

if (failed.length > 0) {
    console.error(`\nType checking failed for: ${failed.join(', ')}`);
    process.exit(1);
}

console.log('\nType checking passed.');
