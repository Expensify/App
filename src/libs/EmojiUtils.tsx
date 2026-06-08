import {parseExpensiMark} from '@expensify/react-native-live-markdown';
import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import {Str} from 'expensify-common';
import lodashSortBy from 'lodash/sortBy';
import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as Emojis from '@assets/emojis';
import type {Emoji, HeaderEmoji, PickerEmojis} from '@assets/emojis/types';
import Text from '@components/Text';
import CONST from '@src/CONST';
import {isFullySupportedLocale} from '@src/CONST/LOCALES';
import type {FrequentlyUsedEmoji, Locale} from '@src/types/onyx';
import type ReportActionReactions from '@src/types/onyx/ReportActionReactions';
import type {ReportActionReaction, UsersReactions} from '@src/types/onyx/ReportActionReactions';
import type IconAsset from '@src/types/utils/IconAsset';
import {isSafari} from './Browser';
import type {getEmojiTrie as getEmojiTrieType} from './EmojiTrie';
import memoize from './memoize';

type HeaderIndices = {code: string; index: number; icon: IconAsset};
type EmojiSpacer = {code: string; spacer: boolean};
type EmojiPickerListItem = EmojiSpacer | Emoji | HeaderEmoji;
type EmojiPickerList = EmojiPickerListItem[];
type ReplacedEmoji = {text: string; emojis: Emoji[]; cursorPosition?: number};
type EmojiTrieModule = {getEmojiTrie: typeof getEmojiTrieType};
type TextWithEmoji = {
    text: string;
    isEmoji: boolean;
};

const findEmojiByName = (name: string): Emoji => Emojis.emojiNameTable[name];

const findEmojiByCode = (code: string): Emoji => Emojis.emojiCodeTableWithSkinTones[code];

// Used for paste paths where shortcode text must be converted before the lazy emoji trie is ready.
function convertEmojiShortcodesToUnicode(text: string): string {
    const emojiData = text.match(CONST.REGEX.EMOJI_NAME);
    if (!emojiData) {
        return text;
    }

    const codeRanges = getCodeRanges(text);

    return text.replace(CONST.REGEX.EMOJI_NAME, (shortcode, position: number) => {
        if (isPositionInsideCodeRanges(codeRanges, position)) {
            return shortcode;
        }

        return Emojis.emojiNameTable[shortcode.slice(1, -1)]?.code ?? shortcode;
    });
}

// 'code' = inline code, 'pre' = code fence content. Excludes 'codeblock' to avoid overlapping ranges.
const CODE_RANGE_TYPES = new Set(['code', 'pre']);

function getCodeRanges(text: string): MarkdownRange[] {
    return parseExpensiMark(text).filter((range) => CODE_RANGE_TYPES.has(range.type));
}

function isPositionInsideCodeRanges(ranges: MarkdownRange[], position: number): boolean {
    return ranges.some((range) => CODE_RANGE_TYPES.has(range.type) && position >= range.start && position < range.start + range.length);
}

function isPositionInsideCodeBlock(text: string, position: number): boolean {
    return isPositionInsideCodeRanges(parseExpensiMark(text), position);
}

/**
 * Get the value to insert for an emoji - returns shortcode if inside code block, otherwise emoji code.
 */
function getEmojiCodeForInsertion(emoji: Emoji, preferredSkinTone: number, isInsideCodeBlock: boolean): string {
    if (isInsideCodeBlock) {
        return `:${emoji.name}:`;
    }
    if (emoji.types?.at(preferredSkinTone) && preferredSkinTone !== -1) {
        return emoji.types.at(preferredSkinTone) ?? emoji.code;
    }
    return emoji.code;
}

/**
 * Revert emojis to shortcodes inside code blocks.
 * Optionally adjusts a cursor position to account for length changes before it.
 */
function revertEmojisInCodeBlocks(text: string, cursorPosition?: number): {text: string; cursorPosition?: number} {
    const codeRanges = getCodeRanges(text);
    if (codeRanges.length === 0) {
        return {text, cursorPosition};
    }

    // Process ranges in reverse order to preserve positions when text length changes
    codeRanges.sort((a, b) => b.start - a.start);

    let result = text;
    let cursorShift = 0;
    for (const range of codeRanges) {
        const codeContent = text.slice(range.start, range.start + range.length);
        // ALL_EMOJIS matches skin-toned variants as single units (e.g., 👍🏽 not 👍 + 🏽)
        const emojiMatches = codeContent.match(CONST.REGEX.ALL_EMOJIS);
        if (!emojiMatches) {
            continue;
        }

        const revertedContent = emojiMatches.reduce((content, emojiMatch) => {
            const emojiData = findEmojiByCode(emojiMatch);
            return emojiData?.name ? content.replace(emojiMatch, `:${emojiData.name}:`) : content;
        }, codeContent);

        if (revertedContent !== codeContent) {
            result = result.slice(0, range.start) + revertedContent + result.slice(range.start + range.length);
            if (cursorPosition !== undefined && range.start + range.length <= cursorPosition) {
                cursorShift += revertedContent.length - codeContent.length;
            }
        }
    }

    const adjustedCursorPosition = cursorPosition !== undefined ? cursorPosition + cursorShift : undefined;
    return {text: result, cursorPosition: adjustedCursorPosition};
}

const sortByName = (emoji: Emoji, emojiData: RegExpMatchArray) => {
    const query = emojiData[0].toLowerCase().slice(1);
    if (emoji.name.includes(query)) {
        return false;
    }
    // An alias match counts as a name match, so emojis with non-readable canonical names
    // (e.g. `+1`/`-1`) can still rank ahead of keyword-only matches when a readable alias matches.
    const fullEmoji = Emojis.emojiNameTable[emoji.name];
    if (fullEmoji?.aliases?.some((alias) => alias.includes(query))) {
        return false;
    }
    return true;
};

const processFrequentlyUsedEmojis = (emojiList?: FrequentlyUsedEmoji[]) => {
    if (!emojiList) {
        return [];
    }

    // On AddComment API response, each variant of the same emoji (with different skin tones) is
    // treated as a separate entry due to unique emoji codes for each variant.
    // So merge duplicate emojis, sum their counts, and use the latest lastUpdatedAt timestamp, then sort accordingly.
    // Prefer hexcode as the dedupe key so that entries stored with only a hexcode merge correctly.
    const frequentlyUsedEmojiMap = new Map<string, FrequentlyUsedEmoji>();
    for (const item of emojiList) {
        let resolvedEmoji: Emoji | undefined;
        if (item.hexcode) {
            resolvedEmoji = Emojis.findEmojiByHexCode(item.hexcode);
        }
        if (!resolvedEmoji && item.name) {
            resolvedEmoji = findEmojiByName(item.name);
        }
        if (!resolvedEmoji && item.code) {
            resolvedEmoji = findEmojiByCode(item.code);
        }
        if (!resolvedEmoji) {
            continue;
        }
        const key = resolvedEmoji.hexcode ?? resolvedEmoji.code;
        const existingEmoji = frequentlyUsedEmojiMap.get(key);
        if (existingEmoji) {
            existingEmoji.count += item.count;
            existingEmoji.lastUpdatedAt = Math.max(existingEmoji.lastUpdatedAt, item.lastUpdatedAt);
        } else {
            const entry: FrequentlyUsedEmoji = {
                code: resolvedEmoji.code,
                name: resolvedEmoji.name,
                hexcode: resolvedEmoji.hexcode,
                types: resolvedEmoji.types,
                count: item.count,
                lastUpdatedAt: item.lastUpdatedAt,
            };
            if (item.keywords) {
                entry.keywords = item.keywords;
            }
            frequentlyUsedEmojiMap.set(key, entry);
        }
    }
    return Array.from(frequentlyUsedEmojiMap.values()).sort((a, b) => {
        if (a.count !== b.count) {
            return b.count - a.count;
        }
        return b.lastUpdatedAt - a.lastUpdatedAt;
    });
};

/**
 * Given an English emoji name, get its localized version
 */
const getLocalizedEmojiName = (name: string, locale: OnyxEntry<Locale>): string => {
    const normalizedLocale = locale && isFullySupportedLocale(locale) ? locale : CONST.LOCALES.EN;

    // Hex-keyed reactions (e.g. '1F44D') must be resolved to their shortcode name before
    // locale lookup, since emojiNameTable is indexed by name, not hexcode.
    const shortcodeName = Emojis.findEmojiByHexCode(name)?.name ?? name;

    if (normalizedLocale === CONST.LOCALES.DEFAULT) {
        return shortcodeName;
    }

    const emojiCode = Emojis.emojiNameTable[shortcodeName]?.code ?? '';
    return Emojis.localeEmojis[normalizedLocale]?.[emojiCode]?.name ?? '';
};

/**
 * Get the unicode code of an emoji in base 16.
 */
const getEmojiUnicode = memoize(
    (input: string) => {
        if (input.length === 0) {
            return '';
        }

        if (input.length === 1) {
            return input
                .charCodeAt(0)
                .toString()
                .split(' ')
                .map((val) => parseInt(val, 10).toString(16))
                .join(' ');
        }

        const pairs = [];

        // Some Emojis in UTF-16 are stored as a pair of 2 Unicode characters (e.g. Flags)
        // The first char is generally between the range U+D800 to U+DBFF called High surrogate
        // & the second char between the range U+DC00 to U+DFFF called low surrogate
        // More info in the following links:
        // 1. https://docs.microsoft.com/en-us/windows/win32/intl/surrogates-and-supplementary-characters
        // 2. https://thekevinscott.com/emojis-in-javascript/
        for (let i = 0; i < input.length; i++) {
            if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
                // high surrogate
                if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                    // low surrogate
                    pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
                }
            } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
                // modifiers and joiners
                pairs.push(input.charCodeAt(i));
            }
        }
        return pairs.map((val) => parseInt(String(val), 10).toString(16)).join(' ');
    },
    {monitoringName: 'getEmojiUnicode'},
);

/**
 * Validates first character is emoji in text string
 */
function isFirstLetterEmoji(message: string): boolean {
    const trimmedMessage = Str.replaceAll(message.replaceAll(' ', ''), '\n', '');
    const match = trimmedMessage.match(CONST.REGEX.ALL_EMOJIS);

    if (!match) {
        return false;
    }

    return trimmedMessage.startsWith(match[0]);
}

/**
 * Validates that this message contains only emojis
 */
function containsOnlyEmojis(message: string): boolean {
    if (!message) {
        return false;
    }

    const trimmedMessage = Str.replaceAll(message.replaceAll(' ', ''), '\n', '');
    const match = trimmedMessage.match(CONST.REGEX.ALL_EMOJIS);

    if (!match) {
        return false;
    }

    const codes = [];
    match.map((emoji) =>
        getEmojiUnicode(emoji)
            .split(' ')
            .map((code) => {
                if (!(CONST.INVISIBLE_CODEPOINTS as readonly string[]).includes(code)) {
                    codes.push(code);
                }
                return code;
            }),
    );

    // Emojis are stored as multiple characters, so we're using spread operator
    // to iterate over the actual emojis, not just characters that compose them
    const messageCodes = [...trimmedMessage]
        .map((char) => getEmojiUnicode(char))
        .filter((string) => string.length > 0 && !(CONST.INVISIBLE_CODEPOINTS as readonly string[]).includes(string));
    return codes.length === messageCodes.length;
}

/**
 * Get the header emojis with their code, icon and index
 */
function getHeaderEmojis(emojis: EmojiPickerList): HeaderIndices[] {
    const headerIndices: HeaderIndices[] = [];
    for (const [index, emoji] of emojis.entries()) {
        if (!('header' in emoji)) {
            continue;
        }
        headerIndices.push({code: emoji.code, index, icon: emoji.icon});
    }
    return headerIndices;
}

/**
 * Push spacer entries into an existing array to pad up to a full row boundary.
 */
function pushDynamicSpacing(target: EmojiPickerList, emojiCount: number, suffix: number): void {
    let modLength = CONST.EMOJI_NUM_PER_ROW - (emojiCount % CONST.EMOJI_NUM_PER_ROW);

    // Empty spaces is pushed if the given row has less than eight emojis
    while (modLength > 0 && modLength < CONST.EMOJI_NUM_PER_ROW) {
        target.push({
            code: `${CONST.EMOJI_SPACER}_${suffix}_${modLength}`,
            spacer: true,
        });
        modLength -= 1;
    }
}

/**
 * Add dynamic spaces to emoji categories
 */
function addSpacesToEmojiCategories(emojis: PickerEmojis): EmojiPickerList {
    const updatedEmojis: EmojiPickerList = [];
    let index = 0;
    for (const emoji of emojis) {
        if (emoji && typeof emoji === 'object' && 'header' in emoji) {
            pushDynamicSpacing(updatedEmojis, updatedEmojis.length, index);
            updatedEmojis.push(emoji);
            pushDynamicSpacing(updatedEmojis, 1, index);
        } else {
            updatedEmojis.push(emoji);
        }
        index++;
    }
    return updatedEmojis;
}

/**
 * Get a merged array with frequently used emojis
 */
function mergeEmojisWithFrequentlyUsedEmojis(emojis: PickerEmojis, frequentlyUsedEmojis: FrequentlyUsedEmoji[]): EmojiPickerList {
    if (frequentlyUsedEmojis.length === 0) {
        return addSpacesToEmojiCategories(emojis);
    }

    const updatedEmojis: EmojiPickerList = [];
    let index = 0;

    // Frequently-used section
    pushDynamicSpacing(updatedEmojis, updatedEmojis.length, index);
    updatedEmojis.push(Emojis.categoryFrequentlyUsed);
    pushDynamicSpacing(updatedEmojis, 1, index);
    index++;

    // count/lastUpdatedAt/keywords are read by the picker but not declared on the base Emoji type.
    for (const entry of frequentlyUsedEmojis) {
        const baseEmoji = findEmojiByCode(entry.code) ?? findEmojiByName(entry.name);
        const emoji = {
            code: baseEmoji.code,
            name: baseEmoji.name,
            hexcode: baseEmoji.hexcode,
            types: baseEmoji.types,
            count: entry.count,
            lastUpdatedAt: entry.lastUpdatedAt,
            ...(entry.keywords ? {keywords: entry.keywords} : {}),
        } as Emoji;
        updatedEmojis.push(emoji);
        index++;
    }

    for (const emoji of emojis) {
        if (emoji && typeof emoji === 'object' && 'header' in emoji) {
            pushDynamicSpacing(updatedEmojis, updatedEmojis.length, index);
            updatedEmojis.push(emoji);
            pushDynamicSpacing(updatedEmojis, 1, index);
        } else {
            updatedEmojis.push(emoji);
        }
        index++;
    }

    return updatedEmojis;
}

/**
 * Given an emoji item object, return an emoji code based on its type.
 */
const getEmojiCodeWithSkinColor = (item: Emoji, preferredSkinToneIndex: OnyxEntry<number | string>): string => {
    const {code, types} = item;

    if (typeof preferredSkinToneIndex === 'number' && types?.[preferredSkinToneIndex]) {
        return types.at(preferredSkinToneIndex) ?? '';
    }

    return code;
};

/**
 * Extracts emojis from a given text.
 *
 * @param text - The text to extract emojis from.
 * @returns An array of emoji codes.
 */
function extractEmojis(text: string): Emoji[] {
    if (!text) {
        return [];
    }

    // Parse Emojis including skin tones - Eg: ['👩🏻', '👩🏻', '👩🏼', '👩🏻', '👩🏼', '👩']
    const parsedEmojis = text.match(CONST.REGEX.ALL_EMOJIS);

    if (!parsedEmojis) {
        return [];
    }

    const emojis: Emoji[] = [];

    // Text can contain similar emojis as well as their skin tone variants. Create a Set to remove duplicate emojis from the search.

    for (const character of parsedEmojis) {
        const emoji = Emojis.emojiCodeTableWithSkinTones[character];
        if (emoji) {
            emojis.push(emoji);
        }
    }

    return emojis;
}

/**
 * Take the current emojis and the former emojis and return the emojis that were added, if we add an already existing emoji, we also return it
 * @param currentEmojis The array of current emojis
 * @param formerEmojis The array of former emojis
 * @returns The array of added emojis
 */
function getAddedEmojis(currentEmojis: Emoji[], formerEmojis: Emoji[]): Emoji[] {
    const newEmojis: Emoji[] = [...currentEmojis];
    // We are removing the emojis from the newEmojis array if they were already present before.
    for (const formerEmoji of formerEmojis) {
        const indexOfAlreadyPresentEmoji = newEmojis.findIndex((newEmoji) => newEmoji.code === formerEmoji.code);
        if (indexOfAlreadyPresentEmoji >= 0) {
            newEmojis.splice(indexOfAlreadyPresentEmoji, 1);
        }
    }
    return newEmojis;
}

/**
 * Replace any emoji name in a text with the emoji icon.
 * If we're on mobile, we also add a space after the emoji granted there's no text after it.
 */
function replaceEmojis(text: string, preferredSkinTone: OnyxEntry<number | string> = CONST.EMOJI_DEFAULT_SKIN_TONE, locale: Locale = CONST.LOCALES.DEFAULT): ReplacedEmoji {
    const {getEmojiTrie} = require<EmojiTrieModule>('./EmojiTrie');

    const normalizedLocale = locale && isFullySupportedLocale(locale) ? locale : CONST.LOCALES.EN;
    const trie = getEmojiTrie(normalizedLocale);
    if (!trie) {
        return {text, emojis: []};
    }

    let newText = text;
    const emojis: Emoji[] = [];
    const emojiData = text.match(CONST.REGEX.EMOJI_NAME);
    if (!emojiData || emojiData.length === 0) {
        return {text: revertEmojisInCodeBlocks(newText).text, emojis};
    }

    const codeBlockRanges = parseExpensiMark(text);
    const replacements: Array<{position: number; shortcode: string; replacement: string; name: string}> = [];
    const shortcodeSearchPositions: Record<string, number> = {};
    const englishTrie = normalizedLocale !== CONST.LOCALES.DEFAULT ? getEmojiTrie(CONST.LOCALES.DEFAULT) : null;

    for (const emoji of emojiData) {
        const name = emoji.slice(1, -1);
        const searchFromPosition = shortcodeSearchPositions[emoji] ?? 0;
        const emojiPosition = text.indexOf(emoji, searchFromPosition);

        if (emojiPosition !== -1) {
            shortcodeSearchPositions[emoji] = emojiPosition + 1;
        }

        if (emojiPosition === -1 || isPositionInsideCodeRanges(codeBlockRanges, emojiPosition)) {
            continue;
        }

        let checkEmoji = trie.search(name);
        if (!checkEmoji?.metaData?.code && englishTrie) {
            checkEmoji = englishTrie.search(name);
        }
        if (checkEmoji?.metaData?.code && checkEmoji?.metaData?.name) {
            const meta = checkEmoji.metaData;
            const code = meta.code;
            const hexcode = meta.hexcode ?? (code ? findEmojiByCode(code)?.hexcode : undefined) ?? findEmojiByName(name)?.hexcode;
            if (!code || !hexcode) {
                continue;
            }
            const emojiReplacement = getEmojiCodeWithSkinColor({...meta, code, hexcode} as Emoji, preferredSkinTone);
            emojis.push({
                name,
                code,
                types: meta.types,
                hexcode,
            });
            replacements.push({
                position: emojiPosition,
                shortcode: emoji,
                replacement: emojiReplacement ?? '',
                name,
            });
        }
    }

    // Apply replacements right-to-left to preserve positions
    replacements.sort((a, b) => b.position - a.position);
    for (const {position, shortcode, replacement} of replacements) {
        newText = newText.slice(0, position) + replacement + newText.slice(position + shortcode.length);
    }

    let cursorPosition: number | undefined;
    const firstReplacement = replacements.at(0);
    if (firstReplacement) {
        const offsetFromLeftReplacements = replacements.slice(1).reduce((acc, r) => acc + (r.replacement.length - r.shortcode.length), 0);
        cursorPosition = firstReplacement.position + firstReplacement.replacement.length + offsetFromLeftReplacements;
    }

    // cursorPosition points to the end of the last replaced emoji. Append a space
    // at the cursor position, but only if the next character is not already a space.
    if (cursorPosition && cursorPosition > 0) {
        const space = ' ';
        if (newText.charAt(cursorPosition) !== space) {
            newText = newText.slice(0, cursorPosition) + space + newText.slice(cursorPosition);
        }
        cursorPosition += space.length;
    }

    const reverted = revertEmojisInCodeBlocks(newText, cursorPosition);
    return {text: reverted.text, emojis, cursorPosition: reverted.cursorPosition};
}

/**
 * Find all emojis in a text and replace them with their code.
 */
function replaceAndExtractEmojis(text: string, preferredSkinTone: OnyxEntry<number | string> = CONST.EMOJI_DEFAULT_SKIN_TONE, locale: Locale = CONST.LOCALES.DEFAULT): ReplacedEmoji {
    const normalizedLocale = locale && isFullySupportedLocale(locale) ? locale : CONST.LOCALES.EN;

    const {text: convertedText = '', emojis = [], cursorPosition} = replaceEmojis(text, preferredSkinTone, normalizedLocale);

    return {
        text: convertedText,
        emojis: emojis.concat(extractEmojis(text)),
        cursorPosition,
    };
}

/**
 * Suggest emojis when typing emojis prefix after colon
 * @param [limit] - matching emojis limit
 */
function suggestEmojis(text: string, locale: Locale = CONST.LOCALES.DEFAULT, limit: number = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS): Emoji[] | undefined {
    const {getEmojiTrie} = require<EmojiTrieModule>('./EmojiTrie');

    const normalizedLocale = locale && isFullySupportedLocale(locale) ? locale : CONST.LOCALES.EN;
    const trie = getEmojiTrie(normalizedLocale);
    if (!trie) {
        return [];
    }

    const emojiData = text.match(CONST.REGEX.EMOJI_SUGGESTIONS);
    if (!emojiData) {
        return [];
    }

    const matching: Emoji[] = [];
    const nodes = trie.getAllMatchingWords(emojiData[0].toLowerCase().slice(1), limit);
    for (const node of nodes) {
        // The trie stores aliases as separate nodes pointing to the same emoji, so prefer the
        // canonical name from `metaData.name` over the trie path so dedupe and result names are consistent.
        const canonicalName = node.metaData?.name ?? node.name;
        if (node.metaData?.code && !matching.find((obj) => obj.name === canonicalName)) {
            const hexcode = node.metaData.hexcode ?? findEmojiByCode(node.metaData.code)?.hexcode ?? findEmojiByName(canonicalName)?.hexcode;
            if (!hexcode) {
                continue;
            }
            if (matching.length === limit) {
                return lodashSortBy(matching, (emoji) => sortByName(emoji, emojiData));
            }
            matching.push({code: node.metaData.code, name: canonicalName, types: node.metaData.types, hexcode});
        }
        const suggestions = node.metaData.suggestions;
        if (!suggestions) {
            return;
        }
        for (const suggestion of suggestions) {
            if (matching.length === limit) {
                return lodashSortBy(matching, (emoji) => sortByName(emoji, emojiData));
            }

            if (!matching.find((obj) => obj.name === suggestion.name)) {
                const hexcode = suggestion.hexcode ?? findEmojiByCode(suggestion.code)?.hexcode;
                if (!hexcode) {
                    continue;
                }
                matching.push({...suggestion, hexcode});
            }
        }
    }
    return lodashSortBy(matching, (emoji) => sortByName(emoji, emojiData));
}

/**
 * Given an emoji object it returns the correct emoji code
 * based on the users preferred skin tone.
 */
const getPreferredEmojiCode = (emoji: Emoji, preferredSkinTone: OnyxEntry<string | number>): string => {
    if (emoji.types && typeof preferredSkinTone === 'number') {
        const emojiCodeWithSkinTone = preferredSkinTone >= 0 ? emoji.types.at(preferredSkinTone) : undefined;

        // Note: it can happen that preferredSkinTone has a outdated format,
        // so it makes sense to check if we actually got a valid emoji code back
        if (emojiCodeWithSkinTone) {
            return emojiCodeWithSkinTone;
        }
    }

    return emoji.code;
};

/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji, sorted by the reaction timestamp.
 */
const getUniqueEmojiCodes = (emojiAsset: Emoji, users: UsersReactions): string[] => {
    const emojiCodes: Record<string, string> = Object.values(users ?? {}).reduce((result: Record<string, string>, userSkinTones) => {
        for (const skinTone of Object.keys(userSkinTones?.skinTones ?? {})) {
            const createdAt = userSkinTones.skinTones[Number(skinTone)];
            const emojiCode = getPreferredEmojiCode(emojiAsset, Number(skinTone));
            if (!!emojiCode && (!result[emojiCode] || createdAt < result[emojiCode])) {
                // eslint-disable-next-line no-param-reassign
                result[emojiCode] = createdAt;
            }
        }
        return result;
    }, {});

    return Object.keys(emojiCodes ?? {}).sort((a, b) => (new Date(emojiCodes[a]) > new Date(emojiCodes[b]) ? 1 : -1));
};

/**
 * Given an emoji reaction object and its name, it populates it with the oldest reaction timestamps.
 */
const enrichEmojiReactionWithTimestamps = (emoji: ReportActionReaction, emojiName: string): ReportActionReaction => {
    let oldestEmojiTimestamp: string | null = null;

    const usersWithTimestamps: UsersReactions = {};
    for (const [id, user] of Object.entries(emoji.users ?? {})) {
        const userTimestamps = Object.values(user?.skinTones ?? {});
        const oldestUserTimestamp = userTimestamps.reduce((min, curr) => {
            if (min) {
                return curr < min ? curr : min;
            }
            return curr;
        }, userTimestamps.at(0));

        if (!oldestUserTimestamp) {
            continue;
        }

        if (!oldestEmojiTimestamp || oldestUserTimestamp < oldestEmojiTimestamp) {
            oldestEmojiTimestamp = oldestUserTimestamp;
        }

        usersWithTimestamps[id] = {
            ...user,
            id,
            oldestTimestamp: oldestUserTimestamp,
        };
    }

    return {
        ...emoji,
        users: usersWithTimestamps,
        // Just in case two emojis have the same timestamp, also combine the timestamp with the
        // emojiName so that the order will always be the same. Without this, the order can be pretty random
        // and shift around a little bit.
        oldestTimestamp: (oldestEmojiTimestamp ?? emoji.createdAt) + emojiName,
    };
};

/**
 * Returns true if the accountID has reacted to the report action (with the given skin tone).
 * Uses the NEW FORMAT for "emojiReactions"
 * @param usersReactions - all the users reactions
 */
function hasAccountIDEmojiReacted(accountID: number, usersReactions: UsersReactions, skinTone?: number) {
    if (skinTone === undefined) {
        return !!usersReactions[accountID];
    }
    const userReaction = usersReactions[accountID];
    if (!userReaction?.skinTones || !Object.values(userReaction?.skinTones ?? {}).length) {
        return false;
    }
    return !!userReaction.skinTones[skinTone];
}

/**
 * Given an emoji reaction and current user's account ID, it returns the reusable details of the emoji reaction.
 */
const getEmojiReactionDetails = (emojiName: string, reaction: ReportActionReaction, currentUserAccountID: number) => {
    const {users, oldestTimestamp} = enrichEmojiReactionWithTimestamps(reaction, emojiName);

    const emoji = Emojis.findEmojiByHexCode(emojiName) ?? findEmojiByName(emojiName);
    const emojiCodes = emoji ? getUniqueEmojiCodes(emoji, users) : [];
    const reactionCount = Object.values(users ?? {})
        .map((user) => Object.values(user?.skinTones ?? {}).length)
        .reduce((sum, curr) => sum + curr, 0);
    const hasUserReacted = hasAccountIDEmojiReacted(currentUserAccountID, users);
    const userAccountIDs = Object.values(users ?? {})
        .sort((a, b) => (a.oldestTimestamp > b.oldestTimestamp ? 1 : -1))
        .map((user) => Number(user.id));

    return {
        emoji,
        emojiCodes,
        reactionCount,
        hasUserReacted,
        userAccountIDs,
        oldestTimestamp,
    };
};

/**
 * Collapses a ReportActionReactions map so that entries whose keys resolve to the same emoji
 * (one legacy name-key and one hex-key for the same 👍, for example) are merged into a single
 * entry. This prevents rendering duplicate reaction bubbles during the transitional period
 * when Onyx may contain both formats simultaneously.
 *
 * The first key seen for a canonical emoji is kept; subsequent collisions are merged into it
 * (per-user skinTones union, earliest timestamps, preserved pendingAction).
 */
const mergeReactionsByEmoji = (reactions: ReportActionReactions): ReportActionReactions => {
    const merged: ReportActionReactions = {};
    const canonicalToKey: Record<string, string> = {};

    for (const [key, reaction] of Object.entries(reactions)) {
        if (!reaction) {
            continue;
        }

        const resolved = Emojis.findEmojiByHexCode(key) ?? findEmojiByName(key);
        const canonical = resolved?.hexcode ?? key;

        const existingKey = canonicalToKey[canonical];
        if (existingKey) {
            const existing = merged[existingKey];
            if (!existing) {
                continue;
            }

            const mergedUsers: UsersReactions = {...existing.users};
            for (const [userID, newUser] of Object.entries(reaction.users ?? {})) {
                if (!newUser) {
                    continue;
                }
                const existingUser = mergedUsers[userID];
                if (existingUser) {
                    mergedUsers[userID] = {
                        ...existingUser,
                        skinTones: {...existingUser.skinTones, ...newUser.skinTones},
                        oldestTimestamp: existingUser.oldestTimestamp < newUser.oldestTimestamp ? existingUser.oldestTimestamp : newUser.oldestTimestamp,
                    };
                } else {
                    mergedUsers[userID] = newUser;
                }
            }

            merged[existingKey] = {
                ...existing,
                createdAt: existing.createdAt < reaction.createdAt ? existing.createdAt : reaction.createdAt,
                oldestTimestamp: existing.oldestTimestamp < reaction.oldestTimestamp ? existing.oldestTimestamp : reaction.oldestTimestamp,
                users: mergedUsers,
                pendingAction: existing.pendingAction ?? reaction.pendingAction,
            };
        } else {
            canonicalToKey[canonical] = key;
            merged[key] = reaction;
        }
    }

    return merged;
};

/**
 * Given an emoji code, returns an base emoji code without skin tone
 */
const getRemovedSkinToneEmoji = (emoji?: string) => emoji?.replaceAll(CONST.REGEX.EMOJI_SKIN_TONES, '');

function getSpacersIndexes(allEmojis: EmojiPickerList): number[] {
    const spacersIndexes: number[] = [];
    for (const [index, emoji] of allEmojis.entries()) {
        if (!(CONST.EMOJI_PICKER_ITEM_TYPES.SPACER in emoji)) {
            continue;
        }

        spacersIndexes.push(index);
    }
    return spacersIndexes;
}

/** Splits the text with emojis into array if emojis exist in the text */
function splitTextWithEmojis(text = ''): TextWithEmoji[] {
    if (!text) {
        return [];
    }

    const doesTextContainEmojis = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g')).test(text);

    if (!doesTextContainEmojis) {
        return [];
    }

    // The regex needs to be cloned because `exec()` is a stateful operation and maintains the state inside
    // the regex variable itself, so we must have an independent instance for each function's call.
    const emojisRegex = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g'));

    const splitText: TextWithEmoji[] = [];
    let regexResult: RegExpExecArray | null;
    let lastMatchIndexEnd = 0;

    do {
        regexResult = emojisRegex.exec(text);

        if (regexResult?.indices?.[0]) {
            const matchIndexStart = regexResult.indices[0][0];
            const matchIndexEnd = regexResult.indices[0][1];

            if (matchIndexStart > lastMatchIndexEnd) {
                splitText.push({
                    text: text.slice(lastMatchIndexEnd, matchIndexStart),
                    isEmoji: false,
                });
            }

            splitText.push({
                text: text.slice(matchIndexStart, matchIndexEnd),
                isEmoji: true,
            });

            lastMatchIndexEnd = matchIndexEnd;
        }
    } while (regexResult !== null);

    if (lastMatchIndexEnd < text.length) {
        splitText.push({
            text: text.slice(lastMatchIndexEnd, text.length),
            isEmoji: false,
        });
    }

    return splitText;
}

function getProcessedText(processedTextArray: TextWithEmoji[], style: StyleProp<TextStyle>): Array<React.JSX.Element | string> {
    return processedTextArray.map(({text, isEmoji}, index) =>
        isEmoji ? (
            <Text
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={style}
            >
                {text}
            </Text>
        ) : (
            text
        ),
    );
}

function containsCustomEmoji(text?: string): boolean {
    if (!text) {
        return false;
    }

    const privateUseAreaRegex = CONST.REGEX.PRIVATE_USER_AREA;
    return privateUseAreaRegex.test(text);
}

function containsOnlyCustomEmoji(text?: string): boolean {
    if (!text) {
        return false;
    }

    const privateUseAreaRegex = CONST.REGEX.ONLY_PRIVATE_USER_AREA;
    return privateUseAreaRegex.test(text);
}

/**
 * Insert Variation Selector 15 (FE0E) between digits/symbols and emojis to prevent Safari's automatic keycap sequence bug.
 *
 * Safari has a browser-specific behavior where it automatically converts a digit or symbol (#, *)
 * immediately followed by an emoji into a Unicode keycap sequence (e.g., "1" + "😄" becomes "1️⃣").
 * This happens at the browser's input handling level before React can process the text,
 * causing character corruption or unexpected joining.
 *
 * FE0E (Variation Selector 15) is a non-printing Unicode character that forces text presentation.
 * Unlike ZWNJ (U+200C) which has Grapheme_Cluster_Break=Control and creates a separate grapheme cluster
 * (causing cursor navigation and deletion issues), FE0E has Grapheme_Cluster_Break=Extend which makes it
 * attach to the preceding character as part of the same grapheme cluster. This means:
 * - No invisible extra cursor stops between digit and emoji
 * - Backspace correctly deletes the digit (not an invisible character)
 * - Arrow keys move smoothly past the digit-emoji boundary
 *
 * Example: "234😄" becomes "234\uFE0E😄" (FE0E is invisible but prevents Safari's corruption)
 */
function insertTextVSBetweenDigitAndEmoji(input: string): string {
    if (!isSafari()) {
        return input;
    }

    // Fix corrupted key caps that Safari created (key cap followed by emoji indicates corruption)
    let result = input.replaceAll(CONST.REGEX.CORRUPTED_KEYCAP_FOLLOWED_BY_EMOJI, '$1\uFE0E$2');
    // Insert FE0E between digit/symbol and emoji (the main fix to prevent corruption)
    result = result.replaceAll(CONST.REGEX.DIGIT_OR_SYMBOL_FOLLOWED_BY_EMOJI, '$1\uFE0E$2');

    return result;
}

/**
 * Calculate the text VS (FE0E) offset for cursor position adjustment.
 * Returns the number of FE0E characters that would be inserted before the cursor position.
 */
function getTextVSCursorOffset(text: string, cursorPosition: number | undefined | null): number {
    if (!isSafari() || cursorPosition === undefined || cursorPosition === null) {
        return 0;
    }

    const beforeCursor = text.substring(0, cursorPosition);

    let processed = beforeCursor;
    processed = processed.replaceAll(CONST.REGEX.CORRUPTED_KEYCAP_FOLLOWED_BY_EMOJI, '$1\uFE0E$2');
    processed = processed.replaceAll(CONST.REGEX.DIGIT_OR_SYMBOL_FOLLOWED_BY_EMOJI, '$1\uFE0E$2');

    return processed.length - beforeCursor.length;
}

export type {HeaderIndices, EmojiPickerList, EmojiPickerListItem};

export {
    findEmojiByCode,
    convertEmojiShortcodesToUnicode,
    getLocalizedEmojiName,
    getProcessedText,
    getHeaderEmojis,
    mergeEmojisWithFrequentlyUsedEmojis,
    containsOnlyEmojis,
    replaceEmojis,
    suggestEmojis,
    getEmojiCodeWithSkinColor,
    getPreferredEmojiCode,
    getEmojiReactionDetails,
    mergeReactionsByEmoji,
    replaceAndExtractEmojis,
    extractEmojis,
    getAddedEmojis,
    isFirstLetterEmoji,
    hasAccountIDEmojiReacted,
    getRemovedSkinToneEmoji,
    getSpacersIndexes,
    splitTextWithEmojis,
    containsCustomEmoji,
    containsOnlyCustomEmoji,
    processFrequentlyUsedEmojis,
    insertTextVSBetweenDigitAndEmoji,
    getTextVSCursorOffset,
    isPositionInsideCodeBlock,
    getEmojiCodeForInsertion,
};
