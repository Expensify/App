#!/usr/bin/env bun

import {main} from './benchmarkAppStartup';

if (import.meta.main) {
    main(`${import.meta.dirname}/..`).catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
