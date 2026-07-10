#!/usr/bin/env bun

/**
 * CLI entry point for scripts/bumpVersion.ts. This file is never imported by anything (the action and tests import
 * the library directly), so it can unconditionally parse argv and run — no entry guard needed.
 */
import * as versionUpdater from '@github/libs/versionUpdater';

import run from './bumpVersion';

// Get and validate SEMVER_LEVEL input
const semanticVersionLevel = process.argv.at(2) ?? 'BUILD';
if (!versionUpdater.isValidSemverLevel(semanticVersionLevel)) {
    throw new Error(`Invalid semver level ${semanticVersionLevel}. Must be one of: ${Object.values(versionUpdater.SEMANTIC_VERSION_LEVELS).join(', ')}`);
}
run(semanticVersionLevel);
