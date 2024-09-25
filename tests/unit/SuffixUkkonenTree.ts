import {DELIMITER_CHAR_CODE, END_CHAR_CODE, makeTree, stringToNumeric} from '@libs/SuffixUkkonenTree';

describe('SuffixUkkonenTree', () => {
    it('should insert, build, and find all occurrences', () => {
        const tree = makeTree([...stringToNumeric('banana'), DELIMITER_CHAR_CODE, ...stringToNumeric('pancake'), END_CHAR_CODE]);
        tree.build();
        expect(tree.findSubstring(stringToNumeric('an'))).toEqual(expect.arrayContaining([1, 3, 8]));
    });

    it('should handle identical words', () => {
        const tree = makeTree([...stringToNumeric('banana'), DELIMITER_CHAR_CODE, ...stringToNumeric('banana'), END_CHAR_CODE]);
        tree.build();
        expect(tree.findSubstring(stringToNumeric('an'))).toEqual(expect.arrayContaining([1, 3, 8, 10]));
    });
});
