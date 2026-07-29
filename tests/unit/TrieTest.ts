import Trie from '@src/libs/Trie';

describe('Trie', () => {
    it('Test if a node can be found in the Trie', () => {
        const wordTrie = new Trie();
        const {node: grinningNode} = wordTrie.getOrCreate('grinning');
        grinningNode.metaData = {code: '😀'};
        const {node: grinNode} = wordTrie.getOrCreate('grin');
        grinNode.metaData = {code: '😁'};
        const {node: joyNode} = wordTrie.getOrCreate('joy');
        joyNode.metaData = {code: '😂'};
        wordTrie.getOrCreate('rofl');
        expect(wordTrie.search('eyes')).toBeNull();
        expect(wordTrie.search('joy')?.metaData).toEqual({code: '😂'});
        expect(wordTrie.search('gRiN')?.metaData).toEqual({code: '😁'});
    });

    it('Test finding all leaf nodes starting with a substring', () => {
        const wordTrie = new Trie();
        wordTrie.getOrCreate('John').node.metaData = {code: '👨🏿', suggestions: []};
        wordTrie.getOrCreate('Robert').node.metaData = {code: '👨🏾', suggestions: []};
        wordTrie.getOrCreate('Robertson').node.metaData = {code: '👨🏽', suggestions: []};
        wordTrie.getOrCreate('Rock').node.metaData = {code: '👨🏼', suggestions: []};
        const expected = [
            {name: 'robert', metaData: {code: '👨🏾', suggestions: []}},
            {name: 'robertson', metaData: {code: '👨🏽', suggestions: []}},
            {name: 'rock', metaData: {code: '👨🏼', suggestions: []}},
        ];
        expect(wordTrie.getAllMatchingWords('Ro')).toEqual(expected);
        expect(wordTrie.getAllMatchingWords('ro')).toEqual(expected);
    });

    it('Test finding only the first 5 matching words', () => {
        const wordTrie = new Trie();
        wordTrie.getOrCreate('John').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Robert').node.metaData = {code: '👨🏾', suggestions: []};
        wordTrie.getOrCreate('Robertson').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Rock').node.metaData = {code: '👨🏽', suggestions: []};
        wordTrie.getOrCreate('Rob').node.metaData = {code: '👨🏻', suggestions: []};
        wordTrie.getOrCreate('Rocco').node.metaData = {code: '👨🏿', suggestions: []};
        wordTrie.getOrCreate('Roger').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Roni').node.metaData = {code: '👨🏻', suggestions: []};
        expect(wordTrie.getAllMatchingWords('Ro').length).toBe(5);
    });

    it('Test finding a specific number of matching words', () => {
        const wordTrie = new Trie();
        const limit = 7;
        wordTrie.getOrCreate('John').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Robert').node.metaData = {code: '👨🏾', suggestions: []};
        wordTrie.getOrCreate('Robertson').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Rock').node.metaData = {code: '👨🏽', suggestions: []};
        wordTrie.getOrCreate('Rob').node.metaData = {code: '👨🏻', suggestions: []};
        wordTrie.getOrCreate('Rocco').node.metaData = {code: '👨🏿', suggestions: []};
        wordTrie.getOrCreate('Roger').node.metaData = {code: '👨🏼', suggestions: []};
        wordTrie.getOrCreate('Roni').node.metaData = {code: '👨🏻', suggestions: []};
        expect(wordTrie.getAllMatchingWords('Ro', limit).length).toBe(limit);
    });

    it('Test throwing an error when try to insert an empty word into the Trie.', () => {
        const wordTrie = new Trie();
        expect(() => {
            wordTrie.getOrCreate('');
        }).toThrow('Cannot insert empty word into Trie');
    });

    it('Test that getOrCreate returns isNew correctly', () => {
        const wordTrie = new Trie();
        expect(wordTrie.getOrCreate('smile').isNew).toBe(true);
        expect(wordTrie.getOrCreate('smile').isNew).toBe(false);
    });
});
