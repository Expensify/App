import _ from 'underscore';
import emojis from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supportedLanguages = [CONST.LOCALES.DEFAULT, CONST.LOCALES.ES];

function createTrie(lang = CONST.LOCALES.DEFAULT) {
    const trie = new Trie();

    // Inserting all emojis into the Trie object
    _.forEach(emojis, (item) => {
        if (item.header) {
            return;
        }

        const name = item.name[lang];
        if (!name) {
            return;
        }

        const node = trie.search(name);
        if (!node) {
            trie.add(name, {code: item.code, types: item.types, name: item.name, suggestions: []});
        } else {
            trie.update(name, {code: item.code, types: item.types, name: item.name, suggestions: node.metaData.suggestions});
        }

        const keywords = item.keywords[lang];
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], {suggestions: [{code: item.code, types: item.types, name: item.name}]});
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name: item.name}],
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
