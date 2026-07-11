import formatExpensifyRsyslogLine from '@server/libs/formatExpensifyRsyslogLine';
import Log from '@server/stubs/expensify-log';
import {afterEach, beforeEach, describe, expect, test} from 'bun:test';

// VCR_LOG_DESTINATION=stderr forces the fallback path so these tests are deterministic regardless
// of whether /run/systemd/journal/syslog exists on the host (it does in the CI docker container,
// per ci/docker/syslog/rsyslog.conf, but not on a bare macOS dev machine).
const REQUEST_ID = 'VCLOG_TEST_STUB';

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

describe('expensify-log stub', () => {
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

    test('exports the levels the headless bundle relies on', () => {
        const stub = Log as Record<string, unknown>;

        for (const methodName of ['info', 'alert', 'warn', 'hmmm']) {
            expect(typeof stub[methodName]).toBe('function');
        }
    });

    test('info() falls back to a stderr line matching formatExpensifyRsyslogLine', () => {
        Log.info('render succeeded', true, {outPath: '/tmp/chart.png'});

        const [expectedLine] = formatExpensifyRsyslogLine({level: 'info', message: 'render succeeded', params: {outPath: '/tmp/chart.png'}, requestId: REQUEST_ID});
        expect(stderrCapture.writes).toEqual([`${expectedLine}\n`]);
    });

    test('alert() maps to the [alrt] level', () => {
        Log.alert('render failed', {message: 'boom'});

        const [expectedLine] = formatExpensifyRsyslogLine({level: 'alrt', message: 'render failed', params: {message: 'boom'}, requestId: REQUEST_ID});
        expect(stderrCapture.writes).toEqual([`${expectedLine}\n`]);
    });

    test('warn() maps to the [warn] level', () => {
        Log.warn('slow render');

        const [expectedLine] = formatExpensifyRsyslogLine({level: 'warn', message: 'slow render', requestId: REQUEST_ID});
        expect(stderrCapture.writes).toEqual([`${expectedLine}\n`]);
    });

    test('hmmm() maps to the [hmmm] level', () => {
        Log.hmmm('unexpected but recoverable');

        const [expectedLine] = formatExpensifyRsyslogLine({level: 'hmmm', message: 'unexpected but recoverable', requestId: REQUEST_ID});
        expect(stderrCapture.writes).toEqual([`${expectedLine}\n`]);
    });

    test('splits multi-line output into one write per chunk when a message needs chunking', () => {
        const longMessage = 'x'.repeat(8000);
        Log.alert(longMessage);

        const expectedLines = formatExpensifyRsyslogLine({level: 'alrt', message: longMessage, requestId: REQUEST_ID});
        expect(stderrCapture.writes).toEqual(expectedLines.map((line) => `${line}\n`));
    });
});
