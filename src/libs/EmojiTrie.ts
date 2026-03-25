import emojis, {localeEmojis} from '@assets/emojis';
import type {Emoji, HeaderEmoji} from '@assets/emojis/types';
import CONST from '@src/CONST';
import {FULLY_SUPPORTED_LOCALES} from '@src/CONST/LOCALES';
import type {FullySupportedLocale} from '@src/CONST/LOCALES';
import StringUtils from './StringUtils';
import {endSpan, startSpan} from './telemetry/activeSpans';

type EmojiMetaData = {
    suggestions?: Emoji[];
    code?: string;
    types?: readonly string[];
    name?: string;
};

type EmojiSearchIndex = {
    /** Exact match lookup: lowercased key → metadata */
    exactMap: Map<string, EmojiMetaData>;
    /** Sorted keys for prefix search via binary search */
    sortedKeys: string[];
};

type EmojiSearchIndexForLocale = Partial<Record<FullySupportedLocale, EmojiSearchIndex>>;

/**
 * Add keywords to the search index map. For each keyword, either creates a new entry
 * with the emoji as a suggestion, or appends/prepends the emoji to an existing entry's suggestions.
 */
function addKeywordsToMap(map: Map<string, EmojiMetaData>, keywords: string[], item: Emoji, name: string, shouldPrependKeyword = false) {
    for (const keyword of keywords) {
        const lowerKeyword = keyword.toLowerCase();
        const normalizedKeyword = StringUtils.normalizeAccents(lowerKeyword);
        const existing = map.get(lowerKeyword);

        if (!existing) {
            const metadata: EmojiMetaData = {suggestions: [{code: item.code, types: item.types, name}]};
            map.set(lowerKeyword, metadata);
            if (normalizedKeyword !== lowerKeyword) {
                map.set(normalizedKeyword, metadata);
            }
        } else {
            const suggestion = {code: item.code, types: item.types, name};
            const suggestions = shouldPrependKeyword ? [suggestion, ...(existing.suggestions ?? [])] : [...(existing.suggestions ?? []), suggestion];
            const newMetadata: EmojiMetaData = {
                ...existing,
                suggestions,
            };
            map.set(lowerKeyword, newMetadata);
            if (normalizedKeyword !== lowerKeyword) {
                map.set(normalizedKeyword, newMetadata);
            }
        }
    }
}

/**
 * Allows searching based on parts of the name. This turns 'white_large_square' into ['white_large_square', 'large_square', 'square'].
 */
function getNameParts(name: string): string[] {
    const nameSplit = name.split('_');
    return nameSplit.map((_namePart, index) => nameSplit.slice(index).join('_'));
}

function createSearchIndex(lang: FullySupportedLocale = CONST.LOCALES.DEFAULT): EmojiSearchIndex {
    const map = new Map<string, EmojiMetaData>();
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
        const lowerLocaleName = localeName.toLowerCase();
        const normalizedName = StringUtils.normalizeAccents(lowerLocaleName);

        const existing = map.get(lowerLocaleName);
        if (!existing) {
            const metadata: EmojiMetaData = {code: emoji.code, types: emoji.types, name: localeName, suggestions: []};
            map.set(lowerLocaleName, metadata);
            if (normalizedName !== lowerLocaleName) {
                map.set(normalizedName, metadata);
            }
        } else {
            const newMetadata: EmojiMetaData = {code: emoji.code, types: emoji.types, name: localeName, suggestions: existing.suggestions};
            map.set(lowerLocaleName, newMetadata);
            if (normalizedName !== lowerLocaleName) {
                map.set(normalizedName, newMetadata);
            }
        }

        const nameParts = getNameParts(localeName).slice(1); // We remove the first part because we already index the full name.
        addKeywordsToMap(map, nameParts, emoji, localeName);

        // Add keywords for both the locale language and English to enable users to search using either language.
        const keywords = (langEmojis?.[emoji.code]?.keywords ?? []).concat(isDefaultLocale ? [] : (defaultLangEmojis?.[emoji.code]?.keywords ?? []));
        addKeywordsToMap(map, keywords, emoji, localeName);

        /**
         * If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
         * We do this because when the user types the english name of the emoji, we want to show the emoji in the suggestions before all the others.
         */
        if (!isDefaultLocale) {
            const englishNameParts = getNameParts(englishName);
            addKeywordsToMap(map, englishNameParts, emoji, localeName, true);
        }
    }

    const sortedKeys = Array.from(map.keys()).sort();

    return {exactMap: map, sortedKeys};
}

/**
 * Find all entries matching a prefix, using binary search on sorted keys.
 */
function getAllMatchingWords(index: EmojiSearchIndex, prefix: string, limit = 5): Array<{name: string; metaData: EmojiMetaData}> {
    const {sortedKeys, exactMap} = index;
    const results: Array<{name: string; metaData: EmojiMetaData}> = [];

    // Binary search for first key >= prefix
    let lo = 0;
    let hi = sortedKeys.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const midKey = sortedKeys.at(mid);
        if (midKey !== undefined && midKey < prefix) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    // Scan forward while keys start with prefix
    for (let i = lo; i < sortedKeys.length && results.length < limit; i++) {
        const key = sortedKeys.at(i);
        if (!key?.startsWith(prefix)) {
            break;
        }
        const metaData = exactMap.get(key);
        if (metaData) {
            results.push({name: key, metaData});
        }
    }

    return results;
}

const emojiSearchIndexForLocale: EmojiSearchIndexForLocale = Object.values(FULLY_SUPPORTED_LOCALES).reduce((acc, lang) => {
    acc[lang] = undefined;
    return acc;
}, {} as EmojiSearchIndexForLocale);

const buildEmojiSearchIndex = (locale: FullySupportedLocale) => {
    if (emojiSearchIndexForLocale[locale]) {
        return; // Return early if the index is already built
    }
    startSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_SEARCH_INDEX_BUILD, {
        name: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_SEARCH_INDEX_BUILD,
        op: CONST.TELEMETRY.SPAN_LOCALE.EMOJI_SEARCH_INDEX_BUILD,
    });
    emojiSearchIndexForLocale[locale] = createSearchIndex(locale);
    endSpan(CONST.TELEMETRY.SPAN_LOCALE.EMOJI_SEARCH_INDEX_BUILD);
};

/**
 * Returns the emoji search index for the given locale, building it lazily on first access.
 */
const getEmojiSearchIndex = (locale: FullySupportedLocale): EmojiSearchIndex | undefined => {
    buildEmojiSearchIndex(locale);
    return emojiSearchIndexForLocale[locale];
};

export default emojiSearchIndexForLocale;
export {buildEmojiSearchIndex, getEmojiSearchIndex, getAllMatchingWords};
export type {EmojiMetaData, EmojiSearchIndex};
