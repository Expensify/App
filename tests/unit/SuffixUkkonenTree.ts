import {makeTree} from '@libs/SuffixUkkonenTree';

describe('SuffixUkkonenTree', () => {
    it('should work', () => {
        const tree = makeTree([
            {
                data: ['banana'],
                transform: (data) => data,
            },
        ]);
        tree.build();
        expect(tree.findInSearchTree('an')).toEqual([['banana']]);
    });

    it('should work 2', () => {
        const tree = makeTree([
            {
                data: ['banana', 'test'],
                transform: (data) => data,
            },
        ]);
        tree.build();

        expect(tree.findInSearchTree('es')).toEqual([['test']]);
    });
});
