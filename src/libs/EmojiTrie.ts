import emojis, {importEmojiLocale, localeEmojis} from '@assets/emojis';
import type {Emoji, HeaderEmoji} from '@assets/emojis/types';
import CONST from '@src/CONST';
import {FULLY_SUPPORTED_LOCALES} from '@src/CONST/LOCALES';
import type {FullySupportedLocale} from '@src/CONST/LOCALES';
import StringUtils from './StringUtils';
import {endSpan, startSpan} from './telemetry/activeSpans';
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
    const suggestion = {code: item.code, types: item.types, name};
    for (const keyword of keywords) {
        const {node, isNew} = trie.getOrCreate(keyword);
        if (isNew) {
            node.metaData = {suggestions: [suggestion]};
        } else if (shouldPrependKeyword) {
            (node.metaData.suggestions ??= []).unshift(suggestion);
        } else {
            (node.metaData.suggestions ??= []).push(suggestion);
        }

        const normalizedKeyword = StringUtils.normalizeAccents(keyword);
        if (normalizedKeyword !== keyword) {
            const {node: normNode} = trie.getOrCreate(normalizedKeyword);
            normNode.metaData = node.metaData;
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
    const parts: string[] = [name];
    let idx = name.indexOf('_');
    while (idx !== -1) {
        parts.push(name.slice(idx + 1));
        idx = name.indexOf('_', idx + 1);
    }
    return parts;
}

function createTrie(lang: FullySupportedLocale = CONST.LOCALES.DEFAULT): Trie<EmojiMetaData> {
    const trie = new Trie();
    const langEmojis = localeEmojis[lang];
    const defaultLangEmojis = localeEmojis[CONST.LOCALES.DEFAULT];
    const isDefaultLocale = lang === CONST.LOCALES.DEFAULT;

    for (const pickerEmoji of emojis) {
        if ((pickerEmoji as HeaderEmoji).header) {
            continue;
        }

        const emoji = pickerEmoji as Emoji;

        const englishName = emoji.name;
        const localeName = langEmojis?.[emoji.code]?.name ?? englishName;
        const normalizedName = StringUtils.normalizeAccents(localeName);

        const {node, isNew} = trie.getOrCreate(localeName);
        if (isNew) {
            node.metaData = {code: emoji.code, types: emoji.types, name: localeName, suggestions: []};
        } else {
            node.metaData = {suggestions: [...((node.metaData.suggestions as Emoji[] | undefined) ?? [])], code: emoji.code, types: emoji.types, name: localeName};
        }
        if (normalizedName !== localeName) {
            const {node: normNode} = trie.getOrCreate(normalizedName);
            normNode.metaData = node.metaData;
        }

        const nameParts = getNameParts(localeName).slice(1); // We remove the first part because we already index the full name.
        addKeywordsToTrie(trie, nameParts, emoji, localeName);

        // Add keywords for both the locale language and English to enable users to search using either language.
        const keywords = (langEmojis?.[emoji.code]?.keywords ?? []).concat(isDefaultLocale ? [] : (defaultLangEmojis?.[emoji.code]?.keywords ?? []));
        addKeywordsToTrie(trie, keywords, emoji, localeName);

        /**
         * If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
         * We do this because when the user types the english name of the emoji, we want to show the emoji in the suggestions before all the others.
         */
        if (!isDefaultLocale) {
            const englishNameParts = getNameParts(englishName);
            addKeywordsToTrie(trie, englishNameParts, emoji, localeName, true);
        }
    }

    return trie;
}

const emojiTrieForLocale: EmojiTrieForLocale = Object.values(FULLY_SUPPORTED_LOCALES).reduce((acc, lang) => {
    acc[lang] = undefined;
    return acc;
}, {} as EmojiTrieForLocale);

const buildEmojisTrie = (locale: FullySupportedLocale) => {
    if (emojiTrieForLocale[locale]) {
        return; // Return early if the trie is already built
    }
    // Don't build and cache the trie if locale emoji data hasn't been loaded yet,
    // otherwise we'd permanently cache a trie with only English fallback names.
    if (!localeEmojis[locale]) {
        startSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_IMPORT, {
            name: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_IMPORT,
            op: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_IMPORT,
        });
        importEmojiLocale(locale).then(() => {
            endSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_IMPORT);
        });
        return;
    }
    startSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_TRIE_BUILD, {
        name: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_TRIE_BUILD,
        op: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_TRIE_BUILD,
    });
    emojiTrieForLocale[locale] = createTrie(locale);
    endSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_TRIE_BUILD);
};

/**
 * Returns the trie for the given locale, building it lazily on first access.
 */
const getEmojiTrie = (locale: FullySupportedLocale): Trie<EmojiMetaData> | undefined => {
    buildEmojisTrie(locale);
    return emojiTrieForLocale[locale];
};

export default emojiTrieForLocale;
export {buildEmojisTrie, getEmojiTrie};
