import {DELIMITER_CHAR_CODE, END_CHAR_CODE, makeTree, stringToNumeric} from '@libs/SuffixUkkonenTree';

describe('SuffixUkkonenTree', () => {
    it('should insert, build, and find all occurrences', () => {
        const tree = makeTree([...stringToNumeric('banana'), DELIMITER_CHAR_CODE, ...stringToNumeric('pancake'), END_CHAR_CODE]);
        tree.build();
        expect(tree.findSubstring(stringToNumeric('an'))).toEqual(expect.arrayContaining([1, 3, 8]));
    });

    it('should handle identical words', () => {
        const tree = makeTree([...stringToNumeric('banana'), DELIMITER_CHAR_CODE, ...stringToNumeric('banana'), DELIMITER_CHAR_CODE, ...stringToNumeric('x'), END_CHAR_CODE]);
        tree.build();
        expect(tree.findSubstring(stringToNumeric('an'))).toEqual(expect.arrayContaining([1, 3, 8, 10]));
    });

    it('should convert string to numeric with a list of chars to skip', () => {
        expect(stringToNumeric('abcabc', new Set(['b']))).toEqual([0, 2, 0, 2]);
    });
});
