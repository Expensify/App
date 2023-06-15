import _ from 'underscore';
import emojis from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supportedLanguages = ['en', 'es'];

function createTrie(lang = 'en') {
    const trie = new Trie();

    // Inserting all emojis into the Trie object
    _.forEach(emojis, (item) => {
        if (item.header) {
            return;
        }

        const shortcode = item.shortcode[lang];
        if (!shortcode) {
            return;
        }

        const node = trie.search(shortcode);
        if (!node) {
            trie.add(shortcode, {code: item.code, types: item.types, suggestions: []});
        } else {
            trie.update(shortcode, {code: item.code, types: item.types, suggestions: node.metaData.suggestions});
        }

        const keywords = item.keywords[lang];
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], {suggestions: [{code: item.code, types: item.types, name: shortcode}]});
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name: shortcode}],
                });
            }
        }
    });

    return trie;
}

const emojiTrie = {};
_.forEach(supportedLanguages, (lang) => {
    emojiTrie[lang] = createTrie(lang);
});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
