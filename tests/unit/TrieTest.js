import Trie from '../../src/libs/Trie';

describe('Trie', () => {
    it('Test if a node can be found in the Trie', () => {
        const emojisTrie = new Trie();
        emojisTrie.add('grinning', {code: '😀'});
        emojisTrie.add('grin', {code: '😁'});
        emojisTrie.add('joy', {code: '😂'});
        emojisTrie.add('rofl', {code: '🤣'});
        expect(emojisTrie.isWord('eyes')).toBeNull();
        expect(emojisTrie.isWord('joy').metaData).toEqual({code: '😂'});
    });

    it('Test finding all leaf nodes starting with a substring', () => {
        const wordTrie = new Trie();
        wordTrie.add('John', {code: '👨🏿', suggestions: []});
        wordTrie.add('Robert', {code: '👨🏾', suggestions: []});
        wordTrie.add('Robertson', {code: '👨🏽', suggestions: []});
        wordTrie.add('Rock', {code: '👨🏼', suggestions: []});
        const expected = [{name: 'Rock', code: '👨🏼'}, {name: 'Robertson', code: '👨🏽'}, {name: 'Robert', code: '👨🏾'}];
        expect(wordTrie.getAllMatchingWords('Ro')).toEqual(expected);
    });

    it('Test finding only the first 5 matching emojis', () => {
        const wordTrie = new Trie();
        wordTrie.add('John', {code: '👨🏼', suggestions: []});
        wordTrie.add('Robert', {code: '👨🏾', suggestions: []});
        wordTrie.add('Robertson', {code: '👨🏼', suggestions: []});
        wordTrie.add('Rock', {code: '👨🏽', suggestions: []});
        wordTrie.add('Rob', {code: '👨🏻', suggestions: []});
        wordTrie.add('Rocco', {code: '👨🏿', suggestions: []});
        wordTrie.add('Roger', {code: '👨🏼', suggestions: []});
        wordTrie.add('Roni', {code: '👨🏻', suggestions: []});
        expect(wordTrie.getAllMatchingWords('Ro').length).toBe(5);
    });

    it('Test throwing an error when try to add an empty word to the Trie.', () => {
        const wordTrie = new Trie();
        expect(() => {
            wordTrie.add('');
        }).toThrow('Cannot insert empty word into Trie :');
    });
});
