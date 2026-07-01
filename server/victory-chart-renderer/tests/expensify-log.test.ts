import Log from '@server/stubs/expensify-log';
import {afterEach, describe, expect, test} from 'bun:test';

const LOG_LINE_PREFIX = 'VCR_LOG ';
const EXPECTED_LOG_METHODS = ['warn', 'hmmm', 'info', 'alert', 'error'] as const;

type CapturedStderr = {
    writes: string[];
    restore: () => void;
};

function captureStderr(): CapturedStderr {
    const writes: string[] = [];
    const originalWrite = process.stderr.write.bind(process.stderr);

    process.stderr.write = ((chunk: string | Uint8Array) => {
        writes.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk));
        return true;
    }) as typeof process.stderr.write;

    return {
        writes,
        restore: () => {
            process.stderr.write = originalWrite;
        },
    };
}

function parseLogLine(line: string) {
    expect(line.startsWith(LOG_LINE_PREFIX)).toBe(true);
    return JSON.parse(line.slice(LOG_LINE_PREFIX.length).trim()) as {
        level: string;
        message: string;
        params: unknown;
        time: string;
    };
}

describe('expensify-log stub', () => {
    let stderrCapture: CapturedStderr | undefined;

    afterEach(() => {
        stderrCapture?.restore();
        stderrCapture = undefined;
    });

    test('exports match headless Log API', () => {
        const stub = Log as Record<string, unknown>;

        for (const methodName of EXPECTED_LOG_METHODS) {
            expect(Object.hasOwn(stub, methodName)).toBe(true);
            expect(typeof stub[methodName]).toBe('function');
        }
    });

    test.each([
        ['warn', 'warn', Log.warn],
        ['hmmm', 'hmmm', Log.hmmm],
        ['info', 'info', Log.info],
        ['alert', 'alert', Log.alert],
        ['error', 'alert', Log.error],
    ] as const)('writes structured %s log line to stderr', (methodName, expectedLevel, logMethod) => {
        stderrCapture = captureStderr();

        logMethod(`${methodName} message`, {jobIndex: 1});

        expect(stderrCapture.writes).toHaveLength(1);
        const record = parseLogLine(stderrCapture.writes[0]);
        expect(record.level).toBe(expectedLevel);
        expect(record.message).toBe(`${methodName} message`);
        expect(record.params).toEqual({jobIndex: 1});
        expect(record.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});
