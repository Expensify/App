#!/usr/bin/env bun

import {main} from './bootstrapForDevice';

if (import.meta.main) {
    main(`${import.meta.dirname}/..`).catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
