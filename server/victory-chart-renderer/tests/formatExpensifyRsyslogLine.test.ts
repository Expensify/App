import formatExpensifyRsyslogLine from '@server/libs/formatExpensifyRsyslogLine';
import {describe, expect, test} from 'bun:test';

const REQUEST_ID = 'VCLOG_TEST_1234';

describe('formatExpensifyRsyslogLine', () => {
    test('formats the prefix like Log.php with an empty email field', () => {
        const [line] = formatExpensifyRsyslogLine({level: 'info', message: 'Victory chart rendered successfully', requestId: REQUEST_ID});

        expect(line).toBe(`<6>victory-chart-renderer: ${REQUEST_ID} victory-chart-renderer  !script! ?vcr? [info] Victory chart rendered successfully`);
    });

    test('uses the correct bracketed tag per level', () => {
        const levels = [
            ['info', '[info]'],
            ['hmmm', '[hmmm]'],
            ['warn', '[warn]'],
            ['alrt', '[alrt]'],
        ] as const;

        for (const [level, tag] of levels) {
            const [line] = formatExpensifyRsyslogLine({level, message: 'msg', requestId: REQUEST_ID});
            expect(line).toContain(tag);
        }
    });

    test('appends object params in ~~ key: value format', () => {
        const [line] = formatExpensifyRsyslogLine({
            level: 'info',
            message: 'Victory chart rendered successfully',
            params: {outPath: '/tmp/chart.png', width: 680, height: 430},
            requestId: REQUEST_ID,
        });

        expect(line.endsWith(" ~~ outPath: '/tmp/chart.png' width: '680' height: '430'")).toBe(true);
    });

    test('omits the ~~ separator when there are no params', () => {
        const [line] = formatExpensifyRsyslogLine({level: 'info', message: 'no params here', requestId: REQUEST_ID});

        expect(line.includes('~~')).toBe(false);
    });

    test('appends string params directly', () => {
        const [line] = formatExpensifyRsyslogLine({level: 'hmmm', message: 'msg', params: 'extra context', requestId: REQUEST_ID});

        expect(line.endsWith(' ~~ extra context')).toBe(true);
    });

    test('appends array-of-object params by flattening entries', () => {
        const [line] = formatExpensifyRsyslogLine({level: 'warn', message: 'msg', params: [{a: '1'}, {b: '2'}], requestId: REQUEST_ID});

        expect(line.endsWith(" ~~ a: '1' b: '2'")).toBe(true);
    });

    test('redacts sensitive-looking param keys', () => {
        const [line] = formatExpensifyRsyslogLine({
            level: 'alrt',
            message: 'render failed',
            params: {authToken: 'super-secret', outPath: '/tmp/chart.png'},
            requestId: REQUEST_ID,
        });

        expect(line).toContain("authToken: '<REDACTED>'");
        expect(line.includes('super-secret')).toBe(false);
        expect(line).toContain("outPath: '/tmp/chart.png'");
    });

    test('serializes Error params using the stack', () => {
        const error = new Error('boom');
        const [line] = formatExpensifyRsyslogLine({level: 'alrt', message: 'render failed', params: error, requestId: REQUEST_ID});

        expect(line).toContain(' ~~ ');
        expect(line).toContain('boom');
    });

    test('chunks messages that would exceed the rsyslog message limit', () => {
        const longMessage = 'x'.repeat(8000);
        const lines = formatExpensifyRsyslogLine({level: 'alrt', message: longMessage, requestId: REQUEST_ID});
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
});
