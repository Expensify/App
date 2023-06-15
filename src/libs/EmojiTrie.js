import emojis from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supported_languages = ['en', 'es'];

function createTrie(emojis, lang = 'en') {
    const trie = new Trie();

    // Inserting all emojis into the Trie object
    for (let i = 0; i < emojis.length; i++) {
        const item = emojis[i];
        if (item.header) continue;

        const shortcode = item.shortcode[lang];
        if (!shortcode) continue;

        const node = trie.search(shortcode);
        if (!node) {
            trie.add(shortcode, { code: item.code, types: item.types, suggestions: [] });
        } else {
            trie.update(shortcode, { code: item.code, types: item.types, suggestions: node.metaData.suggestions });
        }

        const keywords = item.keywords[lang];
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], { suggestions: [{ code: item.code, types: item.types, name: shortcode }] });
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, { code: item.code, types: item.types, name: shortcode }],
                });
            }
        }
    }
    return trie;
}

const emojiTrie = {};
for (const lang of supported_languages) {
    emojiTrie[lang] = createTrie(emojis, lang);
}

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
