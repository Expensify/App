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
 * @param {String} name The (localized) name of the emoji.
 */
function addKeywordsToTrie(trie, keywords, item, name) {
    _.forEach(keywords, (keyword) => {
        const keywordNode = trie.search(keyword);
        if (!keywordNode) {
            trie.add(keyword, {suggestions: [{code: item.code, types: item.types, name}]});
        } else {
            trie.update(keyword, {
                ...keywordNode.metaData,
                suggestions: [...keywordNode.metaData.suggestions, {code: item.code, types: item.types, name}],
            });
        }
    });
}

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

            /**
             * Allow searching based on parts of the name. This turns 'white_large_square' into ['large_square', 'square'].
             * We remove the first part because we already index the full name.
             */
            const nameParts = _.map(nm.split('_'), (_namePart, index, allNameParts) => allNameParts.slice(index).join('_')).slice(1);

            addKeywordsToTrie(trie, nameParts, item, nm);
        });

        const keywords = _.get(langEmojis, [item.code, 'keywords'], []).concat(isDefaultLocale ? [] : _.get(localeEmojis, [CONST.LOCALES.DEFAULT, item.code, 'keywords'], []));
        addKeywordsToTrie(trie, keywords, item, name);
    });

    return trie;
}

const emojiTrie = _.reduce(supportedLanguages, (prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
