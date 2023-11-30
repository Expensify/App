import React from 'react';
import {SvgProps} from 'react-native-svg';
import emojis, {localeEmojis} from '@assets/emojis';
import CONST from '@src/CONST';
import Timing from './actions/Timing';
import Trie from './Trie';

type HeaderEmoji = {
    code: string;
    header: boolean;
    icon: React.FC<SvgProps>;
};

type SimpleEmoji = {
    code: string;
    name: string;
    types?: string[];
};

type Emoji = HeaderEmoji | SimpleEmoji;

type LocalizedEmoji = {
    name?: string;
    keywords: string[];
};

type LocalizedEmojis = Record<string, LocalizedEmoji>;

type Suggestion = {
    code: string;
    types?: string[];
    name: string;
};

type EmojiMetaData = {
    suggestions?: Suggestion[];
    code?: string;
    types?: string[];
    name?: string;
};

Timing.start(CONST.TIMING.TRIE_INITIALIZATION);

const supportedLanguages = [CONST.LOCALES.DEFAULT, CONST.LOCALES.ES] as const;

type SupportedLanguage = (typeof supportedLanguages)[number];

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
function addKeywordsToTrie(trie: Trie<EmojiMetaData>, keywords: string[], item: SimpleEmoji, name: string, shouldPrependKeyword = false) {
    keywords.forEach((keyword) => {
        const keywordNode = trie.search(keyword);
        if (!keywordNode) {
            trie.add(keyword, {suggestions: [{code: item.code, types: item.types, name}]});
        } else {
            const suggestion = {code: item.code, types: item.types, name};
            const suggestions = shouldPrependKeyword ? [suggestion, ...(keywordNode.metaData.suggestions ?? [])] : [...(keywordNode.metaData.suggestions ?? []), suggestion];
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
 * @param name The emoji name
 * @returns An array containing the name parts
 */
function getNameParts(name: string): string[] {
    const nameSplit = name.split('_');
    return nameSplit.map((namePart, index) => nameSplit.slice(index).join('_'));
}

function createTrie(lang: SupportedLanguage = CONST.LOCALES.DEFAULT): Trie<EmojiMetaData> {
    const trie = new Trie();
    const langEmojis: LocalizedEmojis = localeEmojis[lang];
    const defaultLangEmojis: LocalizedEmojis = localeEmojis[CONST.LOCALES.DEFAULT];
    const isDefaultLocale = lang === CONST.LOCALES.DEFAULT;

    emojis
        .filter((item: Emoji): item is SimpleEmoji => !(item as HeaderEmoji).header)
        .forEach((item: SimpleEmoji) => {
            const englishName = item.name;
            const localeName = langEmojis?.[item.code]?.name ?? englishName;

            const node = trie.search(localeName);
            if (!node) {
                trie.add(localeName, {code: item.code, types: item.types, name: localeName, suggestions: []});
            } else {
                trie.update(localeName, {code: item.code, types: item.types, name: localeName, suggestions: node.metaData.suggestions});
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

const emojiTrie: EmojiTrie = supportedLanguages.reduce((prev, cur) => ({...prev, [cur]: createTrie(cur)}), {});

Timing.end(CONST.TIMING.TRIE_INITIALIZATION);

export default emojiTrie;
export type {SimpleEmoji};
