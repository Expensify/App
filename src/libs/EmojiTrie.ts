import type {TupleToUnion} from 'type-fest';
import emojis, {localeEmojis} from '@assets/emojis';
import type {Emoji, HeaderEmoji, PickerEmoji} from '@assets/emojis/types';
import CONST from '@src/CONST';
import type {Locale} from '@src/types/onyx';
import Timing from './actions/Timing';
import StringUtils from './StringUtils';
import Trie from './Trie';

type EmojiMetaData = {
    suggestions?: Emoji[];
    code?: string;
    types?: string[];
    name?: string;
};

const supportedLanguages = [CONST.LOCALES.DEFAULT, CONST.LOCALES.ES] as const;

type SupportedLanguage = TupleToUnion<typeof supportedLanguages>;

type EmojiTrie = {
    [key in SupportedLanguage]?: Trie<EmojiMetaData>;
};

/**
 *
 * @param trie The Trie object.
 * @param keywords An array containing the keywords.
 * @param item An object containing the properties of the emoji.
 * @param name The localized name of the emoji.
 * @param shouldPrependKeyword Prepend the keyword (instead of append) to the suggestions
 */
function addKeywordsToTrie(trie: Trie<EmojiMetaData>, keywords: string[], item: Emoji, name: string, shouldPrependKeyword = false) {
    keywords.forEach((keyword) => {
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
    });
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

function createTrie(lang: SupportedLanguage = CONST.LOCALES.DEFAULT): Trie<EmojiMetaData> {
    const trie = new Trie();
    const langEmojis = localeEmojis[lang];
    const defaultLangEmojis = localeEmojis[CONST.LOCALES.DEFAULT];
    const isDefaultLocale = lang === CONST.LOCALES.DEFAULT;

    emojis
        .filter((item: PickerEmoji): item is Emoji => !(item as HeaderEmoji).header)
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
            const keywords = (langEmojis?.[item.code]?.keywords ?? []).concat(isDefaultLocale ? [] : defaultLangEmojis?.[item.code]?.keywords ?? []);
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

const emojiTrie: EmojiTrie = supportedLanguages.reduce((acc, lang) => {
    acc[lang] = undefined;
    return acc;
}, {} as EmojiTrie);

const buildEmojisTrie = (locale: Locale) => {
    Timing.start(CONST.TIMING.TRIE_INITIALIZATION);
    // Normalize the locale to lowercase and take the first part before any dash
    const normalizedLocale = locale.toLowerCase().split('-')[0];
    const localeToUse = supportedLanguages.includes(normalizedLocale as SupportedLanguage) ? (normalizedLocale as SupportedLanguage) : undefined;

    if (!localeToUse || emojiTrie[localeToUse]) {
        return; // Return early if the locale is not supported or the trie is already built
    }
    emojiTrie[localeToUse] = createTrie(localeToUse);
    Timing.end(CONST.TIMING.TRIE_INITIALIZATION);
};

export default emojiTrie;
export {buildEmojisTrie};

export type {SupportedLanguage};
