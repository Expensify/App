import Trie from '../../src/libs/Trie';

describe('Trie', () => {
    it('Test if a Trie node is exist in the Trie', () => {
        const emojisTrie = new Trie();
        emojisTrie.add('grinning', '😀');
        emojisTrie.add('grin', '😁');
        emojisTrie.add('joy', '😂');
        emojisTrie.add('rofl', '🤣');
        expect(emojisTrie.isEmoji('grinning')).toEqual({found: true, code: '😀'});
        expect(emojisTrie.isEmoji('eyes')).toEqual({found: false});
    });
});
