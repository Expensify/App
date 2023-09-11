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

        const englishName = item.name;
        const localeName = _.get(langEmojis, [item.code, 'name'], englishName);

        const node = trie.search(localeName);
        if (!node) {
            trie.add(localeName, {code: item.code, types: item.types, name: localeName, suggestions: []});
        } else {
            trie.update(localeName, {code: item.code, types: item.types, name: localeName, suggestions: node.metaData.suggestions});
        }

        // Add keywords for both the locale language and English to enable users to search using either language.
        const keywords = _.get(langEmojis, [item.code, 'keywords'], []).concat(isDefaultLocale ? [] : _.get(localeEmojis, [CONST.LOCALES.DEFAULT, item.code, 'keywords'], []));
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], {suggestions: [{code: item.code, types: item.types, name: localeName}]});
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name: localeName}],
                });
            }
        }

        // If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
        // We do this because when the user types the english name of the emoji, we want to show the emoji in the suggestions before all the others.
        if (!isDefaultLocale) {
            const englishNode = trie.search(englishName);
            if (!englishNode) {
                trie.add(englishName, {suggestions: [{code: item.code, types: item.types, name: localeName}]});
            } else {
                trie.update(englishName, {
                    ...englishNode.metaData,
                    suggestions: [{code: item.code, types: item.types, name: localeName}, ...englishNode.metaData.suggestions],
                });
            }
        }
    });

    return trie;
}

const emojiTrie = _.reduce(supportedLanguages, (prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
