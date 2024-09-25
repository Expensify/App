import {makeTree} from '@libs/SuffixUkkonenTree';

describe('SuffixUkkonenTree', () => {
    it('should insert, build, and find the word', () => {
        const tree = makeTree([
            {
                data: ['banana'],
                transform: (data) => data,
            },
        ]);
        tree.build();
        expect(tree.findInSearchTree('an')).toEqual([['banana']]);
    });

    it('should work with multiple words', () => {
        const tree = makeTree([
            {
                data: ['banana', 'test'],
                transform: (data) => data,
            },
        ]);
        tree.build();

        expect(tree.findInSearchTree('es')).toEqual([['test']]);
    });

    it('should work when providing two data sets', () => {
        const tree = makeTree([
            {
                data: ['erica', 'banana'],
                transform: (data) => data,
            },
            {
                data: ['banana', 'test'],
                transform: (data) => data,
            },
        ]);
        tree.build();

        expect(tree.findInSearchTree('es')).toEqual([[], ['test']]);
    });

    it('should work with numbers', () => {
        const tree = makeTree([
            {
                data: [1, 2, 3, 4, 5],
                transform: (data) => String(data),
            },
        ]);
        tree.build();
        expect(tree.findInSearchTree('2')).toEqual([[2]]);
    });

    it('should work with unicodes', () => {
        const tree = makeTree([
            {
                data: ['banana', 'ñèşťǒř'],
                transform: (data) => data,
            },
        ]);
        tree.build();
        expect(tree.findInSearchTree('èşť')).toEqual([['ñèşťǒř']]);
    });
});
