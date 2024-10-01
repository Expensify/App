import SuffixUkkonenTree from '@libs/SuffixUkkonenTree/index';

describe('SuffixUkkonenTree', () => {
    // The suffix tree doesn't take strings, but expects an array buffer, where strings have been separated by a delimiter.
    function helperStringsToNumericForTree(strings: string[]) {
        const numericLists = strings.map((s) => SuffixUkkonenTree.stringToNumeric(s, {clamp: true}));
        const numericList = numericLists.reduce((acc, {numeric}) => {
            acc.push(...numeric, SuffixUkkonenTree.DELIMITER_CHAR_CODE);
            return acc;
        }, [] as number[]);
        numericList.push(SuffixUkkonenTree.END_CHAR_CODE);
        return Uint8Array.from(numericList);
    }

    it('should insert, build, and find all occurrences', () => {
        const strings = ['banana', 'pancake'];
        const numericIntArray = helperStringsToNumericForTree(strings);

        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();
        const searchValue = SuffixUkkonenTree.stringToNumeric('an', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([1, 3, 8]));
    });

    it('should handle identical words', () => {
        const strings = ['banana', 'banana', 'x'];
        const numericIntArray = helperStringsToNumericForTree(strings);
        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();
        const searchValue = SuffixUkkonenTree.stringToNumeric('an', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([1, 3, 8, 10]));
    });

    it('should convert string to numeric with a list of chars to skip', () => {
        const {numeric} = SuffixUkkonenTree.stringToNumeric('abcabc', {
            charSetToSkip: new Set(['b']),
            clamp: true,
        });
        expect(Array.from(numeric)).toEqual([0, 2, 0, 2]);
    });

    it('should convert string outside of a-z to numeric with clamping', () => {
        const {numeric} = SuffixUkkonenTree.stringToNumeric('2', {
            clamp: true,
        });

        // "2" in ASCII is 50, so base26(50) = [0, 23]
        expect(Array.from(numeric)).toEqual([SuffixUkkonenTree.SPECIAL_CHAR_CODE, 0, 23]);
    });
});
