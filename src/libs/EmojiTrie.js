import emojis from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const emojisTrie = new Trie();

// Inserting all emojis into the Trie object
for (let i = 0; i < emojis.length; i++) {
    if (emojis[i].name) {
        const node = emojisTrie.search(emojis[i].name);
        if (!node) {
            emojisTrie.add(emojis[i].name, {code: emojis[i].code, suggestions: []});
        } else {
            emojisTrie.update(emojis[i].name, {code: emojis[i].code, suggestions: node.metaData.suggestions});
        }

        if (emojis[i].keywords) {
            for (let j = 0; j < emojis[i].keywords.length; j++) {
                const keywordNode = emojisTrie.search(emojis[i].keywords[j]);
                if (!keywordNode) {
                    emojisTrie.add(emojis[i].keywords[j], {suggestions: [{code: emojis[i].code, name: emojis[i].name}]});
                } else {
                    emojisTrie.update(emojis[i].keywords[j],
                        {...keywordNode.metaData, suggestions: [...keywordNode.metaData.suggestions, {code: emojis[i].code, name: emojis[i].name}]});
                }
            }
        }
    }
}
Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojisTrie;
