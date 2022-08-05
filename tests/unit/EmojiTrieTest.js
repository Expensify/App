import Trie from '../../src/libs/Trie';

describe('Trie', () => {
    it('Test if a Trie node is exist in the Trie using an Emoji Trie', () => {
        const emojisTrie = new Trie();
        emojisTrie.add('grinning', '😀');
        emojisTrie.add('grin', '😁');
        emojisTrie.add('joy', '😂');
        emojisTrie.add('rofl', '🤣');
        expect(emojisTrie.isWord('grinning')).toEqual({found: true, code: '😀'});
        expect(emojisTrie.isWord('eyes')).toEqual({found: false});
    });

    it('Test if a Trie node is exist in the Trie using a word Trie', () => {
        const wordTrie = new Trie();
        wordTrie.add('john');
        wordTrie.add('harry');
        wordTrie.add('James');
        wordTrie.add('Robert');
        expect(wordTrie.isWord('James')).toMatchObject({found: true});
        expect(wordTrie.isWord('Steven')).toEqual({found: false});
    });
});
