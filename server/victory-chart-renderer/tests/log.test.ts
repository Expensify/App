import Log from '@server/libs/log';
import {afterEach, beforeEach, describe, expect, test} from 'bun:test';

import vcrLog from '../src/log';

// VCR_LOG_DESTINATION=stderr forces the fallback path so these tests are deterministic regardless
// of whether /run/systemd/journal/syslog exists on the host (it does in the CI docker container,
// per ci/docker/syslog/rsyslog.conf, but not on a bare macOS dev machine).
const REQUEST_ID = 'VCLOG_TEST_STUB';

const TEST_CONFIG = {
    processName: 'test-cli',
    scriptName: 'test-cli',
    sourceTag: 'script',
    callerTag: 'test',
} as const;

const VCR_CONFIG = {
    processName: 'victory-chart-renderer',
    scriptName: 'victory-chart-renderer',
    sourceTag: 'script',
    callerTag: 'vcr',
} as const;

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

describe('Log', () => {
    let stderrCapture: CapturedStderr;

    beforeEach(() => {
        process.env.VCR_LOG_DESTINATION = 'stderr';
        process.env.REQUEST_ID = REQUEST_ID;
        stderrCapture = captureStderr();
    });

    afterEach(() => {
        stderrCapture.restore();
        delete process.env.VCR_LOG_DESTINATION;
        delete process.env.REQUEST_ID;
    });

    test('exports the levels the CLI relies on', () => {
        const log = new Log(TEST_CONFIG);
        const logger = log as Record<string, unknown>;

        for (const methodName of ['info', 'alert', 'warn', 'hmmm']) {
            expect(typeof logger[methodName]).toBe('function');
        }
    });

    test('formats the prefix like Log.php with an empty email field', () => {
        const log = new Log(TEST_CONFIG);
        log.info('render succeeded');

        expect(stderrCapture.writes).toEqual([`<6>test-cli: ${REQUEST_ID} test-cli  !script! ?test? [info] render succeeded\n`]);
    });

    test('uses the correct bracketed tag per level', () => {
        const log = new Log(TEST_CONFIG);
        const cases = [
            {call: () => log.info('msg'), tag: '[info]'},
            {call: () => log.hmmm('msg'), tag: '[hmmm]'},
            {call: () => log.warn('msg'), tag: '[warn]'},
            {call: () => log.alert('msg'), tag: '[alrt]'},
        ] as const;

        for (const {call, tag} of cases) {
            stderrCapture.writes.length = 0;
            call();
            expect(stderrCapture.writes.at(0)).toContain(tag);
        }
    });

    test('appends object params in ~~ key: value format', () => {
        const log = new Log(TEST_CONFIG);
        log.info('render succeeded', true, {outPath: '/tmp/chart.png', width: 680, height: 430});

        expect(stderrCapture.writes.at(0)?.endsWith(" ~~ outPath: '/tmp/chart.png' width: '680' height: '430'\n")).toBe(true);
    });

    test('omits the ~~ separator when there are no params', () => {
        const log = new Log(TEST_CONFIG);
        log.info('no params here');

        expect(stderrCapture.writes.at(0)?.includes('~~')).toBe(false);
    });

    test('appends string params directly', () => {
        const log = new Log(TEST_CONFIG);
        log.hmmm('msg', 'extra context');

        expect(stderrCapture.writes.at(0)?.endsWith(' ~~ extra context\n')).toBe(true);
    });

    test('appends array-of-object params by flattening entries', () => {
        const log = new Log(TEST_CONFIG);
        log.warn('msg', [{a: '1'}, {b: '2'}]);

        expect(stderrCapture.writes.at(0)?.endsWith(" ~~ a: '1' b: '2'\n")).toBe(true);
    });

    test('redacts sensitive-looking param keys', () => {
        const log = new Log(TEST_CONFIG);
        log.alert('render failed', {authToken: 'super-secret', outPath: '/tmp/chart.png'});

        const line = stderrCapture.writes.at(0) ?? '';
        expect(line).toContain("authToken: '<REDACTED>'");
        expect(line.includes('super-secret')).toBe(false);
        expect(line).toContain("outPath: '/tmp/chart.png'");
    });

    test('serializes Error params using the stack', () => {
        const log = new Log(TEST_CONFIG);
        const error = new Error('boom');
        log.alert('render failed', error);

        const line = stderrCapture.writes.at(0) ?? '';
        expect(line).toContain(' ~~ ');
        expect(line).toContain('boom');
    });

    test('chunks messages that would exceed the rsyslog message limit', () => {
        const log = new Log(TEST_CONFIG);
        const longMessage = 'x'.repeat(8000);
        log.alert(longMessage);

        const lines = stderrCapture.writes.map((write) => write.replace(/\n$/, ''));
        const prefixMatch = /^.*\[alrt\] /.exec(lines.at(0) ?? '');
        const prefix = prefixMatch?.[0] ?? '';

        expect(lines.length > 1).toBe(true);
        expect(prefix.length > 0).toBe(true);

        let rejoined = '';
        for (const line of lines) {
            expect(line.length).toBeLessThanOrEqual(7168);
            expect(line.startsWith(prefix)).toBe(true);
            rejoined += line.slice(prefix.length);
        }

        expect(rejoined).toBe(longMessage);
    });

    test('victory-chart-renderer configured log uses VCR metadata', () => {
        vcrLog.info('render succeeded', true, {outPath: '/tmp/chart.png'});

        expect(stderrCapture.writes).toEqual([`<6>victory-chart-renderer: ${REQUEST_ID} victory-chart-renderer  !script! ?vcr? [info] render succeeded ~~ outPath: '/tmp/chart.png'\n`]);
    });

    test('info() on the VCR log matches the VCR prefix', () => {
        vcrLog.info('render succeeded', true, {outPath: '/tmp/chart.png'});

        expect(stderrCapture.writes.at(0)).toContain(`<6>victory-chart-renderer: ${REQUEST_ID} victory-chart-renderer  !script! ?vcr? [info]`);
    });

    test('alert() on the VCR log maps to the [alrt] level', () => {
        vcrLog.alert('render failed', {message: 'boom'});

        expect(stderrCapture.writes.at(0)).toContain('[alrt]');
    });
});
