import _ from 'underscore';
import emojis, {localeEmojis} from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supportedLanguages = [CONST.LOCALES.DEFAULT, CONST.LOCALES.ES];

function createTrie(lang = CONST.LOCALES.DEFAULT) {
    const trie = new Trie();
    const langEmojis = localeEmojis[lang];
    const isDefaultLocale = lang === CONST.LOCALES.DEFAULT;

    _.forEach(emojis, (item) => {
        if (item.header) {
            return;
        }

        const name = isDefaultLocale ? item.name : _.get(langEmojis, [item.code, 'name']);
        const names = isDefaultLocale ? [name] : [...new Set([name, item.name])];
        _.forEach(names, (nm) => {
            const node = trie.search(nm);
            if (!node) {
                trie.add(nm, {code: item.code, types: item.types, name: nm, suggestions: []});
            } else {
                trie.update(nm, {code: item.code, types: item.types, name: nm, suggestions: node.metaData.suggestions});
            }
        });

        const keywords = _.get(langEmojis, [item.code, 'keywords'], []).concat(isDefaultLocale ? [] : _.get(localeEmojis, [CONST.LOCALES.DEFAULT, item.code, 'keywords'], []));
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], {suggestions: [{code: item.code, types: item.types, name}]});
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name}],
                });
            }
        }
    });

    return trie;
}

const emojiTrie = _.reduce(supportedLanguages, (prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
