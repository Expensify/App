import _ from 'underscore';
import emojis, {localeEmojis} from '../../assets/emojis';
import Trie from './Trie';
import Timing from './actions/Timing';
import CONST from '../CONST';

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supportedLanguages = [CONST.LOCALES.DEFAULT, CONST.LOCALES.ES];

/**
 *
 * @param {Trie} trie The Trie object.
 * @param {Array<String>} keywords An array containing the keywords.
 * @param {Object} item An object containing the properties of the emoji.
 * @param {String} name The localized name of the emoji.
 * @param {Boolean} shouldPrependKeyword Prepend the keyword (instead of append) to the suggestions
 */
function addKeywordsToTrie(trie, keywords, item, name, shouldPrependKeyword = false) {
    _.forEach(keywords, (keyword) => {
        const keywordNode = trie.search(keyword);
        if (!keywordNode) {
            trie.add(keyword, {suggestions: [{code: item.code, types: item.types, name}]});
        } else {
            const suggestion = {code: item.code, types: item.types, name};
            const suggestions = shouldPrependKeyword ? [suggestion, ...keywordNode.metaData.suggestions] : [...keywordNode.metaData.suggestions, suggestion];
            trie.update(keyword, {
                ...keywordNode.metaData,
                suggestions,
            });
        }
    });
}

/**
 * Allows searching based on parts of the name. This turns 'white_large_square' into ['white_large_square', 'large_square', 'square'].
 *
 * @param {String} name The emoji name
 * @returns {Array<String>} An array containing the name parts
 */
function getNameParts(name) {
    const nameSplit = name.split('_');
    return _.map(nameSplit, (_namePart, index) => nameSplit.slice(index).join('_'));
}

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

        const nameParts = getNameParts(localeName).slice(1); // We remove the first part because we already index the full name.
        addKeywordsToTrie(trie, nameParts, item, localeName);

        // Add keywords for both the locale language and English to enable users to search using either language.
        const keywords = _.get(langEmojis, [item.code, 'keywords'], []).concat(isDefaultLocale ? [] : _.get(localeEmojis, [CONST.LOCALES.DEFAULT, item.code, 'keywords'], []));
        addKeywordsToTrie(trie, keywords, item, localeName);

        /**
         * If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
         * We do this because when the user types the english name of the emoji, we want to show the emoji in the suggestions before all the others.
         */
        if (!isDefaultLocale) {
            const englishNameParts = getNameParts(englishName);
            addKeywordsToTrie(trie, englishNameParts, item, localeName, true);
        }
    });

    return trie;
}

const emojiTrie = _.reduce(supportedLanguages, (prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
