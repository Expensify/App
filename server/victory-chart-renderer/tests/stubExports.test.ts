import * as telemetryActiveSpansStub from '@server/stubs/telemetry-activeSpans';
import {describe, expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const appRoot = join(import.meta.dir, '../../..');
const activeSpansSourcePath = join(appRoot, 'src/libs/telemetry/activeSpans.ts');

function getNamedExportsFromSource(source: string): string[] {
    const exportMatch = source.match(/export\s*\{([^}]+)\}/);

    if (!exportMatch) {
        throw new Error('Could not find named export block in activeSpans.ts');
    }

    return exportMatch[1]
        .split(',')
        .map((exportName) => exportName.trim())
        .filter(Boolean);
}

describe('telemetry-activeSpans stub', () => {
    test('exports match activeSpans public API', () => {
        const activeSpansSource = readFileSync(activeSpansSourcePath, 'utf8');
        const expectedExports = getNamedExportsFromSource(activeSpansSource);

        const stub = telemetryActiveSpansStub as Record<string, unknown>;

        for (const exportName of expectedExports) {
            expect(Object.hasOwn(stub, exportName)).toBe(true);
            expect(typeof stub[exportName]).toBe('function');
        }
    });
});
