import {describe, expect, it} from 'bun:test';

import TSVUtils from '../../scripts/utils/TSVUtils';

describe('TSVUtils.parse', () => {
    it('returns an empty document for empty input', () => {
        expect(TSVUtils.parse('')).toEqual({leadingComments: '', trailingComments: '', rows: []});
    });

    it('keeps hash comments before the first data row as leading comments', () => {
        const text = `# header
# more

"src/a.ts"\t"no-console"\t1
`;
        expect(TSVUtils.parse(text)).toEqual({
            leadingComments: '# header\n# more',
            trailingComments: '',
            rows: [{cells: ['src/a.ts', 'no-console', 1], comments: ''}],
        });
    });

    it('attaches comments after the first data row to the next data row', () => {
        const text = `"a"\t1
# about b
# still about b
"b"\t2
`;
        expect(TSVUtils.parse(text)).toEqual({
            leadingComments: '',
            trailingComments: '',
            rows: [
                {cells: ['a', 1], comments: ''},
                {cells: ['b', 2], comments: '# about b\n# still about b'},
            ],
        });
    });

    it('keeps comments after the last data row as trailing comments', () => {
        const text = `"a"\t1
# leftover
`;
        expect(TSVUtils.parse(text)).toEqual({
            leadingComments: '',
            trailingComments: '# leftover',
            rows: [{cells: ['a', 1], comments: ''}],
        });
    });

    it('decodes JSON strings that contain tabs and quotes', () => {
        const filename = 'src/foo\t"bar".ts';
        const text = `${JSON.stringify(filename)}\t${JSON.stringify('rule')}\t2\n`;
        expect(TSVUtils.parse(text).rows).toEqual([{cells: [filename, 'rule', 2], comments: ''}]);
    });

    it('parses booleans and null cells', () => {
        expect(TSVUtils.parse('true\tnull\tfalse\n').rows).toEqual([{cells: [true, null, false], comments: ''}]);
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
            {cells: ['ok', 1], comments: ''},
            {cells: ['also', 3], comments: ''},
        ]);
        expect(skipped).toEqual([{line: 'bad\t2', lineNumber: 2}]);
    });

    it('attaches pending comments to the next valid row when an invalid row is skipped', () => {
        const result = TSVUtils.parse('"a"\t1\n# keep me\nbad\t2\n"c"\t3\n', {
            onInvalidRow: () => undefined,
        });
        expect(result.rows).toEqual([
            {cells: ['a', 1], comments: ''},
            {cells: ['c', 3], comments: '# keep me'},
        ]);
    });

    it('ignores blank lines', () => {
        expect(TSVUtils.parse('\n\n"a"\t1\n\n').rows).toEqual([{cells: ['a', 1], comments: ''}]);
    });
});

describe('TSVUtils.serialize', () => {
    it('JSON-encodes each cell and appends a trailing newline per row', () => {
        expect(TSVUtils.serialize({leadingComments: '', trailingComments: '', rows: [{cells: ['src/a.ts', 'no-console', 1], comments: ''}]})).toBe('"src/a.ts"\t"no-console"\t1\n');
    });

    it('writes leading comments before a blank line, then rows', () => {
        expect(TSVUtils.serialize({leadingComments: '# header', trailingComments: '', rows: [{cells: ['a', 1], comments: ''}]})).toBe('# header\n\n"a"\t1\n');
    });

    it('writes trailing comments after the last data row', () => {
        expect(TSVUtils.serialize({leadingComments: '', trailingComments: '# end', rows: [{cells: ['a', 1], comments: ''}]})).toBe('"a"\t1\n# end\n');
    });

    it("writes a row's comments immediately before that row", () => {
        expect(
            TSVUtils.serialize({
                leadingComments: '',
                trailingComments: '',
                rows: [
                    {cells: ['a', 1], comments: ''},
                    {cells: ['b', 2], comments: '# about b'},
                ],
            }),
        ).toBe('"a"\t1\n# about b\n"b"\t2\n');
    });

    it("keeps a row's comments with that row when sort is true", () => {
        expect(
            TSVUtils.serialize(
                {
                    leadingComments: '# header',
                    trailingComments: '# end',
                    rows: [
                        {cells: ['b', 1], comments: '# about b'},
                        {cells: ['a', 2], comments: ''},
                    ],
                },
                {sort: true},
            ),
        ).toBe('# header\n\n"a"\t2\n# about b\n"b"\t1\n# end\n');
    });

    it('preserves input order when sort is omitted', () => {
        expect(
            TSVUtils.serialize({
                leadingComments: '',
                trailingComments: '',
                rows: [
                    {cells: ['b', 1], comments: ''},
                    {cells: ['a', 2], comments: ''},
                ],
            }),
        ).toBe('"b"\t1\n"a"\t2\n');
    });

    it('round-trips leading comments, per-row comments, and trailing comments', () => {
        const original = `# eslint-seatbelt temporarily allowed errors
# docs: https://github.com/justjake/eslint-seatbelt#readme

"../../src/a.ts"\t"no-console"\t1
# grandfathered until the Foo migration
"../../src/b.ts"\t"@typescript-eslint/no-deprecated/Foo"\t2
# trailing note
`;
        expect(TSVUtils.serialize(TSVUtils.parse(original), {sort: true})).toBe(original);
    });
});
