import {describe, expect, it} from 'bun:test';

import TypecheckBaseline from '../../scripts/utils/TypecheckBaseline';

describe('TypecheckBaseline.parseErrors', () => {
    it('groups errors by file and keeps the indented lines that continue a message', () => {
        // Given tsc output with two errors in one file, one of them elaborated over indented lines, and one in another file
        const output = [
            "src/a.ts(1,2): error TS2304: Cannot find name 'document'.",
            "src/a.ts(3,4): error TS2322: Type 'A' is not assignable to type 'B'.",
            "  Property 'x' is missing in type 'A'.",
            "src/b.tsx(5,6): error TS2339: Property 'y' does not exist on type '{}'.",
        ].join('\n');

        // When the output is parsed
        const {errorsByFile, unlocatedErrors} = TypecheckBaseline.parseErrors(output);

        // Then each file has its own errors, and the elaboration stays attached to the error it explains, so it is printed with it
        expect(errorsByFile).toEqual(
            new Map([
                [
                    'src/a.ts',
                    [
                        "src/a.ts(1,2): error TS2304: Cannot find name 'document'.",
                        "src/a.ts(3,4): error TS2322: Type 'A' is not assignable to type 'B'.\n  Property 'x' is missing in type 'A'.",
                    ],
                ],
                ['src/b.tsx', ["src/b.tsx(5,6): error TS2339: Property 'y' does not exist on type '{}'."]],
            ]),
        );
        expect(unlocatedErrors).toEqual([]);
    });

    it('reports errors without a file separately', () => {
        // Given tsc output with an error that has no location, such as a broken tsconfig
        const output = "error TS5083: Cannot read file 'tsconfig.missing.json'.";

        // When the output is parsed
        const {errorsByFile, unlocatedErrors} = TypecheckBaseline.parseErrors(output);

        // Then it is kept apart, because an error without a file can never be covered by a per-file baseline
        expect(errorsByFile.size).toBe(0);
        expect(unlocatedErrors).toEqual([output]);
    });

    it('normalizes Windows path separators', () => {
        // Given an error printed with backslashes
        const output = "src\\libs\\a.ts(1,1): error TS2304: Cannot find name 'window'.";

        // When the output is parsed
        const {errorsByFile} = TypecheckBaseline.parseErrors(output);

        // Then the file key matches the forward-slash paths stored in the baseline
        expect([...errorsByFile.keys()]).toEqual(['src/libs/a.ts']);
    });
});

describe('TypecheckBaseline.compareWithBaseline', () => {
    it('flags new files and higher counts, and reports lower counts and fixed files as improvements', () => {
        // Given a baseline and current counts where one file got worse, one is new, one improved and one is fully fixed
        const baseline = new Map([
            ['src/worse.ts', 1],
            ['src/better.ts', 3],
            ['src/fixed.ts', 2],
            ['src/same.ts', 4],
        ]);
        const counts = new Map([
            ['src/worse.ts', 2],
            ['src/new.ts', 1],
            ['src/better.ts', 1],
            ['src/same.ts', 4],
        ]);

        // When they are compared
        const {exceeded, improved} = TypecheckBaseline.compareWithBaseline(counts, baseline);

        // Then the new and worse files fail the check, and the improved and fixed files can be tightened
        expect(exceeded).toEqual([
            {file: 'src/new.ts', count: 1, allowed: 0},
            {file: 'src/worse.ts', count: 2, allowed: 1},
        ]);
        expect(improved).toEqual([
            {file: 'src/better.ts', count: 1, allowed: 3},
            {file: 'src/fixed.ts', count: 0, allowed: 2},
        ]);
    });
});

describe('TypecheckBaseline.tightenBaseline', () => {
    it('lowers counts and drops fixed files without raising or adding anything', () => {
        // Given a baseline and counts where one file improved, one is fixed, one got worse and one is new
        const baseline = new Map([
            ['src/better.ts', 3],
            ['src/fixed.ts', 2],
            ['src/worse.ts', 1],
        ]);
        const counts = new Map([
            ['src/better.ts', 1],
            ['src/worse.ts', 5],
            ['src/new.ts', 1],
        ]);

        // When the baseline is tightened, as CI does on main
        const tightened = TypecheckBaseline.tightenBaseline(baseline, counts);

        // Then only reductions are written, so tightening can never hide a new error
        expect(tightened).toEqual(
            new Map([
                ['src/better.ts', 1],
                ['src/worse.ts', 1],
            ]),
        );
    });
});

describe('TypecheckBaseline baseline file', () => {
    it('round-trips through serialize and parse, sorted by file, without zero counts', () => {
        // Given counts in no particular order, including a file with no errors
        const counts = new Map([
            ['src/b.ts', 2],
            ['src/a.ts', 1],
            ['src/c.ts', 0],
        ]);

        // When they are written and read back
        const text = TypecheckBaseline.serializeBaseline(counts);
        const parsed = TypecheckBaseline.parseBaseline(text);

        // Then rows are sorted so the file diffs cleanly, files without errors are left out, and the header documents the file
        expect(text.startsWith('# Known errors per file')).toBe(true);
        expect(text.indexOf('"src/a.ts"')).toBeLessThan(text.indexOf('"src/b.ts"'));
        expect(parsed).toEqual(
            new Map([
                ['src/a.ts', 1],
                ['src/b.ts', 2],
            ]),
        );
    });

    it('rejects a row without a positive integer count', () => {
        // Given a hand-edited row with a count of zero
        const text = '"src/a.ts"\t0\n';

        // When it is parsed / Then it throws, so a broken baseline can't quietly allow or block errors
        expect(() => TypecheckBaseline.parseBaseline(text)).toThrow('Invalid typecheck baseline row 1');
    });
});
