#!/usr/bin/env bun

/**
 * CLI entry point for scripts/bumpVersion.ts. This file is never imported by anything (the action and tests import
 * the library directly), so it can unconditionally parse argv and run — no entry guard needed.
 */
import * as versionUpdater from '@github/libs/versionUpdater';

import CLI from 'expensify-common/CLI';

import run from './bumpVersion';

const semverLevelOptions = Object.values(versionUpdater.SEMANTIC_VERSION_LEVELS).join(', ');
const cli = new CLI({
    positionalArgs: [
        {
            name: 'semverLevel',
            description: `Semantic version level to bump (${semverLevelOptions})`,
            default: versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD,
            parse: (val) => {
                if (!versionUpdater.isValidSemverLevel(val)) {
                    throw new Error(`Invalid semver level. Must be one of: ${semverLevelOptions}`);
                }
                return val;
            },
        },
    ],
});

run(cli.positionalArgs.semverLevel).catch((error: unknown) => {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('An unexpected error occurred.');
    }
    process.exit(1);
});
