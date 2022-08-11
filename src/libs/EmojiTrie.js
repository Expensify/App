import emojis from '../../assets/emojis';
import Trie from './Trie';

// Create a Trie object
const emojisTrie = new Trie();

// Inserting all emojis into the Trie object
for (let i = 0; i < emojis.length; i++) {
    if (emojis[i].name) {
        emojisTrie.add(emojis[i].name, {code: emojis[i].code});
    }
}

export default emojisTrie;
