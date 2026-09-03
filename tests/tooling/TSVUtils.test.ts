import {describe, expect, it} from 'bun:test';

import TSVUtils from '../../scripts/utils/TSVUtils';

describe('TSVUtils.parse', () => {
    it('returns an empty document for empty input', () => {
        expect(TSVUtils.parse('')).toEqual({comments: '', rows: []});
    });

    it('separates hash comments from JSON-encoded rows', () => {
        const text = `# header
# more

"src/a.ts"\t"no-console"\t1
`;
        expect(TSVUtils.parse(text)).toEqual({
            comments: '# header\n# more',
            rows: [['src/a.ts', 'no-console', 1]],
        });
    });

    it('decodes JSON strings that contain tabs and quotes', () => {
        const filename = 'src/foo\t"bar".ts';
        const text = `${JSON.stringify(filename)}\t${JSON.stringify('rule')}\t2\n`;
        expect(TSVUtils.parse(text).rows).toEqual([[filename, 'rule', 2]]);
    });

    it('parses booleans and null cells', () => {
        expect(TSVUtils.parse('true\tnull\tfalse\n').rows).toEqual([[true, null, false]]);
    });

    it('throws on invalid JSON by default', () => {
        expect(() => TSVUtils.parse('not-json\t1\n')).toThrow(/Invalid JSON in column 1 at line 1/);
    });

    it('skips invalid rows when onInvalidRow is provided', () => {
        const skipped: Array<{line: string; lineNumber: number}> = [];
        const result = TSVUtils.parse('"ok"\t1\nbad\t2\n"also"\t3\n', {
            onInvalidRow: (_error, line, lineNumber) => {
                skipped.push({line, lineNumber});
            },
        });
        expect(result.rows).toEqual([
            ['ok', 1],
            ['also', 3],
        ]);
        expect(skipped).toEqual([{line: 'bad\t2', lineNumber: 2}]);
    });

    it('ignores blank lines', () => {
        expect(TSVUtils.parse('\n\n"a"\t1\n\n').rows).toEqual([['a', 1]]);
    });
});

describe('TSVUtils.serialize', () => {
    it('JSON-encodes each cell and appends a trailing newline per row', () => {
        expect(TSVUtils.serialize([['src/a.ts', 'no-console', 1]])).toBe('"src/a.ts"\t"no-console"\t1\n');
    });

    it('prepends comments with a blank line before rows', () => {
        expect(TSVUtils.serialize([['a', 1]], '# header')).toBe('# header\n\n"a"\t1\n');
    });

    it('sorts encoded rows when sort is true', () => {
        expect(
            TSVUtils.serialize(
                [
                    ['b', 1],
                    ['a', 2],
                ],
                '',
                {sort: true},
            ),
        ).toBe('"a"\t2\n"b"\t1\n');
    });

    it('preserves input order when sort is omitted', () => {
        expect(
            TSVUtils.serialize([
                ['b', 1],
                ['a', 2],
            ]),
        ).toBe('"b"\t1\n"a"\t2\n');
    });

    it('round-trips comments and rows', () => {
        const original = `# eslint-seatbelt temporarily allowed errors
# docs: https://github.com/justjake/eslint-seatbelt#readme

"../../src/a.ts"\t"no-console"\t1
"../../src/b.ts"\t"@typescript-eslint/no-deprecated/Foo"\t2
`;
        const parsed = TSVUtils.parse(original);
        expect(TSVUtils.serialize(parsed.rows, parsed.comments, {sort: true})).toBe(original);
    });
});
