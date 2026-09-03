#!/usr/bin/env bun

/** Runs the benchmark CLI from the repository root and reports uncaught failures as command-line errors. */

import {main} from './benchmarkAppStartup';

if (import.meta.main) {
    main(`${import.meta.dirname}/..`).catch((error: Error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
