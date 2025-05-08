import DynamicArrayBuffer from '@libs/DynamicArrayBuffer';
import SuffixUkkonenTree from '@libs/SuffixUkkonenTree/index';
import {convertToBase26} from '@libs/SuffixUkkonenTree/utils';

describe('SuffixUkkonenTree', () => {
    // The suffix tree doesn't take strings, but expects an array buffer, where strings have been separated by a delimiter.
    function helperStringsToNumericForTree(strings: string[], charSetToSkip?: Set<string>): DynamicArrayBuffer<Uint8Array> {
        const numericLists = strings.map((s) => SuffixUkkonenTree.stringToNumeric(s, {clamp: true, charSetToSkip}));
        const numericList = numericLists.reduce(
            (acc, {numeric}) => {
                acc.push(...numeric, SuffixUkkonenTree.DELIMITER_CHAR_CODE);
                return acc;
            },
            // The value we pass to makeTree needs to be offset by one
            [0],
        );
        numericList.push(SuffixUkkonenTree.END_CHAR_CODE);
        const arrayBuffer = new DynamicArrayBuffer(numericList.length, Uint8Array);
        numericList.forEach((n) => arrayBuffer.push(n));
        return arrayBuffer;
    }

    it('should build strings correctly', () => {
        const string = 'abc';
        const numeric = SuffixUkkonenTree.stringToNumeric(string, {clamp: true}).numeric;
        expect(Array.from(numeric)).toEqual(expect.arrayContaining([0, 1, 2]));
    });

    it('should insert, build, and find all occurrences', () => {
        const strings = ['banana', 'pancake'];
        const numericIntArray = helperStringsToNumericForTree(strings);

        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();
        const searchValue = SuffixUkkonenTree.stringToNumeric('an', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9]));
    });

    it('should find by first character', () => {
        const strings = ['pancake', 'banana'];
        const numericIntArray = helperStringsToNumericForTree(strings);
        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();
        const searchValue = SuffixUkkonenTree.stringToNumeric('p', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([1]));
    });

    it('should handle identical words', () => {
        const strings = ['banana', 'banana', 'x'];
        const numericIntArray = helperStringsToNumericForTree(strings);
        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();
        const searchValue = SuffixUkkonenTree.stringToNumeric('an', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9, 11]));
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

    it('should find words that contain chars to skip', () => {
        const strings = ['b.an.ana', 'panca.ke'];
        const numericIntArray = helperStringsToNumericForTree(strings, new Set(['.']));
        const tree = SuffixUkkonenTree.makeTree(numericIntArray);
        tree.build();

        const searchValue = SuffixUkkonenTree.stringToNumeric('an', {clamp: true}).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9]));
    });
});

describe('convertToBase26', () => {
    it('should correctly convert small numbers to base-26', () => {
        expect(convertToBase26(1)).toEqual([0]); // A
        expect(convertToBase26(26)).toEqual([25]); // Z
        expect(convertToBase26(27)).toEqual([0, 0]); // AA
    });

    it('should correctly convert numbers around 26 and 32', () => {
        // Numbers where division by 26 and 32 behave differently
        expect(convertToBase26(52)).toEqual([0, 25]); // AZ
        expect(convertToBase26(53)).toEqual([1, 0]); // BA
        expect(convertToBase26(57)).toEqual([1, 4]); // BE
        expect(convertToBase26(63)).toEqual([1, 10]); // BK
    });

    it('should throw an error on negative input', () => {
        expect(() => convertToBase26(-1)).toThrow('convertToBase26: Input must be a non-negative integer');
    });
});
