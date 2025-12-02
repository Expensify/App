import emojis, {localeEmojis} from '@assets/emojis';
import type {Emoji, HeaderEmoji, PickerEmoji} from '@assets/emojis/types';
import CONST from '@src/CONST';
import {FULLY_SUPPORTED_LOCALES} from '@src/CONST/LOCALES';
import type {FullySupportedLocale} from '@src/CONST/LOCALES';
import Timing from './actions/Timing';
import StringUtils from './StringUtils';
import Trie from './Trie';

type EmojiMetaData = {
    suggestions?: Emoji[];
    code?: string;
    types?: string[];
    name?: string;
};

type EmojiTrieForLocale = Partial<Record<FullySupportedLocale, Trie<EmojiMetaData>>>;

/**
 *
 * @param trie The Trie object.
 * @param keywords An array containing the keywords.
 * @param item An object containing the properties of the emoji.
 * @param name The localized name of the emoji.
 * @param shouldPrependKeyword Prepend the keyword (instead of append) to the suggestions
 */
function addKeywordsToTrie(trie: Trie<EmojiMetaData>, keywords: string[], item: Emoji, name: string, shouldPrependKeyword = false) {
    for (const keyword of keywords) {
        const keywordNode = trie.search(keyword);
        const normalizedKeyword = StringUtils.normalizeAccents(keyword);

        if (!keywordNode) {
            const metadata = {suggestions: [{code: item.code, types: item.types, name}]};
            if (normalizedKeyword !== keyword) {
                trie.add(normalizedKeyword, metadata);
            }
            trie.add(keyword, metadata);
        } else {
            const suggestion = {code: item.code, types: item.types, name};
            const suggestions = shouldPrependKeyword ? [suggestion, ...(keywordNode.metaData.suggestions ?? [])] : [...(keywordNode.metaData.suggestions ?? []), suggestion];
            const newMetadata = {
                ...keywordNode.metaData,
                suggestions,
            };
            if (normalizedKeyword !== keyword) {
                trie.update(normalizedKeyword, newMetadata);
            }
            trie.update(keyword, newMetadata);
        }
    }
}

/**
 * Allows searching based on parts of the name. This turns 'white_large_square' into ['white_large_square', 'large_square', 'square'].
 *
 * @param name The emoji name
 * @returns An array containing the name parts
 */
function getNameParts(name: string): string[] {
    const nameSplit = name.split('_');
    return nameSplit.map((namePart, index) => nameSplit.slice(index).join('_'));
}

function createTrie(lang: FullySupportedLocale = CONST.LOCALES.DEFAULT): Trie<EmojiMetaData> {
    const trie = new Trie();
    const langEmojis = localeEmojis[lang];
    const defaultLangEmojis = localeEmojis[CONST.LOCALES.DEFAULT];
    const isDefaultLocale = lang === CONST.LOCALES.DEFAULT;

    emojis
        .filter((item: PickerEmoji): item is Emoji => !(item as HeaderEmoji).header)
        // eslint-disable-next-line unicorn/no-array-for-each
        .forEach((item: Emoji) => {
            const englishName = item.name;
            const localeName = langEmojis?.[item.code]?.name ?? englishName;
            const normalizedName = StringUtils.normalizeAccents(localeName);

            const node = trie.search(localeName);
            if (!node) {
                const metadata = {code: item.code, types: item.types, name: localeName, suggestions: []};
                if (normalizedName !== localeName) {
                    trie.add(normalizedName, metadata);
                }
                trie.add(localeName, metadata);
            } else {
                const newMetadata = {code: item.code, types: item.types, name: localeName, suggestions: node.metaData.suggestions};
                if (normalizedName !== localeName) {
                    trie.update(normalizedName, newMetadata);
                }
                trie.update(localeName, newMetadata);
            }

            const nameParts = getNameParts(localeName).slice(1); // We remove the first part because we already index the full name.
            addKeywordsToTrie(trie, nameParts, item, localeName);

            // Add keywords for both the locale language and English to enable users to search using either language.
            const keywords = (langEmojis?.[item.code]?.keywords ?? []).concat(isDefaultLocale ? [] : (defaultLangEmojis?.[item.code]?.keywords ?? []));
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

const emojiTrieForLocale: EmojiTrieForLocale = Object.values(FULLY_SUPPORTED_LOCALES).reduce((acc, lang) => {
    acc[lang] = undefined;
    return acc;
}, {} as EmojiTrieForLocale);

const buildEmojisTrie = (locale: FullySupportedLocale) => {
    if (emojiTrieForLocale[locale]) {
        return; // Return early if the locale is not supported or the trie is already built
    }
    Timing.start(CONST.TIMING.TRIE_INITIALIZATION);
    emojiTrieForLocale[locale] = createTrie(locale);
    Timing.end(CONST.TIMING.TRIE_INITIALIZATION);
};

export default emojiTrieForLocale;
export {buildEmojisTrie};
