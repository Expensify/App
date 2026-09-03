#!/usr/bin/env bun

import {resolve} from 'node:path';
import process from 'node:process';

import {main} from './benchmarkAppStartup';

if (import.meta.main) {
    main(resolve(import.meta.dirname, '..')).catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
