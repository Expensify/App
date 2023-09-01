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

        const defaultName = item.name;
        const preferredLanguageName = _.get(langEmojis, [item.code, 'name'], defaultName);
        
        // Add the actual name of the emoji for the current language
        const node = trie.search(preferredLanguageName);
        if (!node) {
            trie.add(preferredLanguageName, {code: item.code, types: item.types, name: preferredLanguageName, suggestions: []});
        } else {
            trie.update(preferredLanguageName, {code: item.code, types: item.types, name: preferredLanguageName, suggestions: node.metaData.suggestions});
        }
        
        // Add keywords of both the current language and the default language, in case current language isn't the default.
        const keywords = _.get(langEmojis, [item.code, 'keywords'], []).concat(isDefaultLocale ? [] : _.get(localeEmojis, [CONST.LOCALES.DEFAULT, item.code, 'keywords'], []));;
        for (let j = 0; j < keywords.length; j++) {
            const keywordNode = trie.search(keywords[j]);
            if (!keywordNode) {
                trie.add(keywords[j], {suggestions: [{code: item.code, types: item.types, name: preferredLanguageName}]});
            } else {
                trie.update(keywords[j], {
                    ...keywordNode.metaData,
                    suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name: preferredLanguageName}],
                });
            }
        }

        // If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
        if (!isDefaultLocale) {
            const englishNode = trie.search(defaultName);
            if (!englishNode) {
                trie.add(defaultName, {suggestions: [{code: item.code, types: item.types, name: preferredLanguageName}]});
            } else {
                trie.update(defaultName, {
                    ...englishNode.metaData,
                    suggestions: [{code: item.code, types: item.types, name: preferredLanguageName}, ...englishNode.metaData.suggestions],
                });
            }
        }
    });

    return trie;
}


const emojiTrie = _.reduce(supportedLanguages, (prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
