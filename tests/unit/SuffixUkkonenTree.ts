import {END_CHAR_CODE, makeTree, stringToNumeric} from '@libs/SuffixUkkonenTree';

describe('SuffixUkkonenTree', () => {
    it('should insert, build, and find all occurrences', () => {
        const tree = makeTree([...stringToNumeric('banana'), END_CHAR_CODE]);
        tree.build();
        expect(tree.findSubstring(stringToNumeric('an'))).toEqual([1, 3]);
    });
});
