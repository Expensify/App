import _ from 'underscore';
import lodashOrderBy from 'lodash/orderBy';
import moment from 'moment';
import CONST from '../CONST';
import * as User from './actions/User';

/**
 * Get the unicode code of an emoji in base 16.
 * @param {String} input
 * @returns {String}
 */
function getEmojiUnicode(input) {
    if (input.length === 0) {
        return '';
    }

    if (input.length === 1) {
        return _.map(input.charCodeAt(0).toString().split(' '), val => parseInt(val, 10).toString(16)).join(' ');
    }

    const pairs = [];

    // Some Emojis in UTF-16 are stored as pair of 2 Unicode characters (eg Flags)
    // The first char is generally between the range U+D800 to U+DBFF called High surrogate
    // & the second char between the range U+DC00 to U+DFFF called low surrogate
    // More info in the following links:
    // 1. https://docs.microsoft.com/en-us/windows/win32/intl/surrogates-and-supplementary-characters
    // 2. https://thekevinscott.com/emojis-in-javascript/
    for (let i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) { // high surrogate
            if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) { // low surrogate
                pairs.push(
                    ((input.charCodeAt(i) - 0xd800) * 0x400)
                      + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000,
                );
            }
        } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
            // modifiers and joiners
            pairs.push(input.charCodeAt(i));
        }
    }
    return _.map(pairs, val => parseInt(val, 10).toString(16)).join(' ');
}

/**
 * Function to remove Skin Tone and utf16 surrogates from Emoji
 * @param {String} emojiCode
 * @returns {String}
 */
function trimEmojiUnicode(emojiCode) {
    return emojiCode.replace(/(fe0f|1f3fb|1f3fc|1f3fd|1f3fe|1f3ff)$/, '').trim();
}

/**
 * Validates that this string is composed of a single emoji
 *
 * @param {String} message
 * @returns {Boolean}
 */
function isSingleEmoji(message) {
    const match = message.match(CONST.REGEX.EMOJIS);

    if (!match) {
        return false;
    }

    const matchedEmoji = match[0];
    const matchedUnicode = getEmojiUnicode(matchedEmoji);
    const currentMessageUnicode = trimEmojiUnicode(getEmojiUnicode(message));
    return matchedUnicode === currentMessageUnicode;
}

/**
 * Get the header indices based on the max emojis per row
 * @param {Object[]} emojis
 * @returns {Number[]}
 */
function getDynamicHeaderIndices(emojis) {
    const headerIndices = [];
    _.each(emojis, (emoji, index) => {
        if (!emoji.header) {
            return;
        }
        headerIndices.push(Math.floor(index / CONST.EMOJI_NUM_PER_ROW));
    });
    return headerIndices;
}

/**
 * Get number of empty spaces to be filled to get equal emojis for every row
 * @param {Number} emojiCount
 * @returns {Object[]}
 */
function getDynamicSpacing(emojiCount) {
    const spacerEmojis = [];
    let modLength = CONST.EMOJI_NUM_PER_ROW - (emojiCount % CONST.EMOJI_NUM_PER_ROW);
    while (modLength > 0) {
        spacerEmojis.push({
            code: CONST.EMOJI_SPACER,
        });
        modLength -= 1;
    }
    return spacerEmojis;
}

/**
 * Get a merged array with frequently used emojis
 * @param {Object[]} emojis
 * @param {Object[]} frequentlyUsedEmojis
 * @returns {Object[]}
 */
function mergeEmojisWithFrequentlyUsedEmojis(emojis, frequentlyUsedEmojis = []) {
    if (frequentlyUsedEmojis.length === 0) {
        return emojis;
    }

    let allEmojis = [{
        header: true,
        code: 'Frequently Used',
    }];

    allEmojis = allEmojis.concat(getDynamicSpacing(allEmojis.length));
    allEmojis = allEmojis.concat(frequentlyUsedEmojis, getDynamicSpacing(frequentlyUsedEmojis.length));
    allEmojis = allEmojis.concat(emojis);
    return allEmojis;
}

/**
 * Update the frequently used emojis list by usage and sync with API
 * @param {Object[]} frequentlyUsedEmojis
 * @param {Object} newEmoji
 */
function addToFrequentlyUsedEmojis(frequentlyUsedEmojis, newEmoji) {
    let frequentEmojiList = frequentlyUsedEmojis;
    let currentEmojiCount = 1;
    const currentTimestamp = moment().unix();
    const emojiIndex = _.findIndex(frequentEmojiList, e => e.code === newEmoji.code);
    if (emojiIndex >= 0) {
        currentEmojiCount = frequentEmojiList[emojiIndex].count + 1;
        frequentEmojiList.splice(emojiIndex, 1);
    }
    const updatedEmoji = {...newEmoji, ...{count: currentEmojiCount, lastUpdatedAt: currentTimestamp}};
    const maxFrequentEmojiCount = (CONST.EMOJI_FREQUENT_ROW_COUNT * CONST.EMOJI_NUM_PER_ROW) - 1;

    // We want to make sure the current emoji is added to the list
    // Hence, we take one less than the current high frequent used emojis and if same then sorted by lastUpdatedAt
    frequentEmojiList = lodashOrderBy(frequentEmojiList, ['count', 'lastUpdatedAt'], ['desc', 'desc']);
    frequentEmojiList = frequentEmojiList.slice(0, maxFrequentEmojiCount);
    frequentEmojiList.push(updatedEmoji);

    // Second sorting is required so that new emoji is properly placed at sort-ordered location
    frequentEmojiList = lodashOrderBy(frequentEmojiList, ['count', 'lastUpdatedAt'], ['desc', 'desc']);

    User.setFrequentlyUsedEmojis(frequentEmojiList);
}


export {
    getEmojiUnicode,
    trimEmojiUnicode,
    isSingleEmoji,
    getDynamicHeaderIndices,
    getDynamicSpacing,
    mergeEmojisWithFrequentlyUsedEmojis,
    addToFrequentlyUsedEmojis,
};
