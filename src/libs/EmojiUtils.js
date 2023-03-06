import _ from 'underscore';
import lodashOrderBy from 'lodash/orderBy';
import moment from 'moment';
import CONST from '../CONST';
import * as User from './actions/User';
import emojisTrie from './EmojiTrie';

// /**
//  * Get the unicode code of an emoji in base 16.
//  * @param {String} input
//  * @returns {String}
//  */
// const getEmojiUnicode = _.memoize((input) => {
//     if (input.length === 0) {
//         return '';
//     }

//     if (input.length === 1) {
//         return _.map(input.charCodeAt(0).toString().split(' '), val => parseInt(val, 10).toString(16)).join(' ');
//     }

//     const pairs = [];

//     // Some Emojis in UTF-16 are stored as pair of 2 Unicode characters (eg Flags)
//     // The first char is generally between the range U+D800 to U+DBFF called High surrogate
//     // & the second char between the range U+DC00 to U+DFFF called low surrogate
//     // More info in the following links:
//     // 1. https://docs.microsoft.com/en-us/windows/win32/intl/surrogates-and-supplementary-characters
//     // 2. https://thekevinscott.com/emojis-in-javascript/
//     for (let i = 0; i < input.length; i++) {
//         if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) { // high surrogate
//             if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) { // low surrogate
//                 pairs.push(
//                     ((input.charCodeAt(i) - 0xd800) * 0x400)
//                       + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000,
//                 );
//             }
//         } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
//             // modifiers and joiners
//             pairs.push(input.charCodeAt(i));
//         }
//     }
//     return _.map(pairs, val => parseInt(val, 10).toString(16)).join(' ');
// });

/**
 * Function to remove Skin Tone and utf16 surrogates from Emoji
 * @param {String} emojiCode
 * @returns {String}
 */
function trimEmojiUnicode(emojiCode) {
    return emojiCode.replace(/(fe0f|1f3fb|1f3fc|1f3fd|1f3fe|1f3ff)$/, '').trim();
}

/**
 * Validates that this message contains only emojis
 *
 * @param {String} message
 * @returns {Boolean}
 */
// function containsOnlyEmojis(message) {
//     const trimmedMessage = Str.replaceAll(message.replace(/ /g, ''), '\n', '');
//     const match = trimmedMessage.match(CONST.REGEX.EMOJIS);

//     if (!match) {
//         return false;
//     }

//     const codes = [];
//     _.map(match, emoji => _.map(getEmojiUnicode(emoji).split(' '), (code) => {
//         if (!CONST.INVISIBLE_CODEPOINTS.includes(code)) {
//             codes.push(code);
//         }
//         return code;
//     }));

//     // Emojis are stored as multiple characters, so we're using spread operator
//     // to iterate over the actual emojis, not just characters that compose them
//     const messageCodes = _.filter(_.map([...trimmedMessage], char => getEmojiUnicode(char)), string => string.length > 0 && !CONST.INVISIBLE_CODEPOINTS.includes(string));
//     return codes.length === messageCodes.length;
// }

/**
 * Get the header indices based on the max emojis per row
 * @param {Object[]} emojis
 * @returns {Number[]}
 */
function getHeaderIndices(emojis) {
    const headerIndices = [];
    _.each(emojis, (emoji, index) => {
        if (!emoji.header) {
            return;
        }
        headerIndices.push(index);
    });
    return headerIndices;
}

/**
 * Get number of empty spaces to be filled to get equal emojis for every row
 * @param {Number} emojiCount
 * @param {Number} suffix
 * @returns {Object[]}
 */
function getDynamicSpacing(emojiCount, suffix) {
    const spacerEmojis = [];
    let modLength = CONST.EMOJI_NUM_PER_ROW - (emojiCount % CONST.EMOJI_NUM_PER_ROW);

    // Empty spaces is pushed if the given row has less than eight emojis
    while (modLength > 0 && modLength < CONST.EMOJI_NUM_PER_ROW) {
        spacerEmojis.push({
            code: `${CONST.EMOJI_SPACER}_${suffix}_${modLength}`,
            spacer: true,
        });
        modLength -= 1;
    }
    return spacerEmojis;
}

/**
 * Add dynamic spaces to emoji categories
 * @param {Object[]} emojis
 * @returns {Object[]}
 */
function addSpacesToEmojiCategories(emojis) {
    let updatedEmojis = [];
    _.each(emojis, (emoji, index) => {
        if (emoji.header) {
            updatedEmojis = updatedEmojis.concat(getDynamicSpacing(updatedEmojis.length, index), [emoji], getDynamicSpacing(1, index));
            return;
        }
        updatedEmojis.push(emoji);
    });
    return updatedEmojis;
}

/**
 * Get a merged array with frequently used emojis
 * @param {Object[]} emojis
 * @param {Object[]} frequentlyUsedEmojis
 * @returns {Object[]}
 */
function mergeEmojisWithFrequentlyUsedEmojis(emojis, frequentlyUsedEmojis = []) {
    if (frequentlyUsedEmojis.length === 0) {
        return addSpacesToEmojiCategories(emojis);
    }

    let allEmojis = [{
        header: true,
        code: 'frequentlyUsed',
    }];

    allEmojis = allEmojis.concat(frequentlyUsedEmojis, emojis);
    return addSpacesToEmojiCategories(allEmojis);
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
    User.updateFrequentlyUsedEmojis(frequentEmojiList);
}

/**
 * Replace any emoji name in a text with the emoji icon.
 * If we're on mobile, we also add a space after the emoji granted there's no text after it.
 * @param {String} text
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function replaceEmojis(text, isSmallScreenWidth = false) {
    let newText = text;
    const emojiData = text.match(CONST.REGEX.EMOJI_NAME);
    if (!emojiData || emojiData.length === 0) {
        return text;
    }
    for (let i = 0; i < emojiData.length; i++) {
        const checkEmoji = emojisTrie.search(emojiData[i].slice(1, -1));
        if (checkEmoji && checkEmoji.metaData.code) {
            let emojiReplacement = checkEmoji.metaData.code;

            // If this is the last emoji in the message and it's the end of the message so far,
            // add a space after it so the user can keep typing easily.
            if (isSmallScreenWidth && i === emojiData.length - 1 && text.endsWith(emojiData[i])) {
                emojiReplacement += ' ';
            }
            newText = newText.replace(emojiData[i], emojiReplacement);
        }
    }
    return newText;
}

/**
 * Suggest emojis when typing emojis prefix after colon
 * @param {String} text
 * @param {Number} [limit] - matching emojis limit
 * @returns {Array}
 */
function suggestEmojis(text, limit = 5) {
    const emojiData = text.match(CONST.REGEX.EMOJI_SUGGESTIONS);
    if (emojiData) {
        const matching = [];
        const nodes = emojisTrie.getAllMatchingWords(emojiData[0].toLowerCase().slice(1), limit);
        for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].metaData.code && !_.find(matching, obj => obj.name === nodes[j].name)) {
                if (matching.length === limit) {
                    return matching;
                }
                matching.push({code: nodes[j].metaData.code, name: nodes[j].name, types: nodes[j].metaData.types});
            }
            const suggestions = nodes[j].metaData.suggestions;
            for (let i = 0; i < suggestions.length; i++) {
                if (matching.length === limit) {
                    return matching;
                }
                if (!_.find(matching, obj => obj.name === suggestions[i].name)) {
                    matching.push(suggestions[i]);
                }
            }
        }
        return matching;
    }
    return [];
}

// /**
//  * Validates that this message contains emojis
//  *
//  * @param {String} message
//  * @returns {Boolean}
//  */
// function hasEmojis(message) {
//     if (!message) {
//         return false;
//     }
//     const trimmedMessage = Str.replaceAll(message.replace(/ /g, ''), '\n', '');

//     // return CONST.REGEX.EMOJIS.test(trimmedMessage);
//     return Boolean(trimmedMessage.match(CONST.REGEX.EMOJIS));
// }

/**
 * Get all the emojis in the message
 * @param {String} text
 * @returns {Array}
 */
function getAllEmojiFromText(text) {
    // return an empty array when no text is passed
    if (!text) {
        return [];
    }

    // Unicode Character 'ZERO WIDTH JOINER' (U+200D) is usually used to join surrogate pair together without breaking the emoji
    const zeroWidthJoiner = '\u200D'; // https://codepoints.net/U+200D?lang=en
    const splittedMessage = text.split('');
    const result = [];

    let wordHolder = ''; // word counter
    let emojiHolder = ''; // emoji counter

    const setResult = (word, isEmoji = false) => {
        // for some weird reason javascript sees the empty string `"` as a word with `length = 1`
        // this is caused after splitting the text empty spaces are added to both the start and the end of all emojis and text
        // given the empty space is close to a text then its length is counted as 0
        // while if it's before or after an emoji then it's counted as 1, so we remove the word where word.length equals 1
        // NOTE: this does not affect a single character element example typing `[i | J]` cause after splitting its empty word.length is calculated as 0
        if (!isEmoji && word.length === 1) {
            return;
        }

        result.push({text: word, isEmoji});
    };

    _.forEach(splittedMessage, (word, index) => {
        if (CONST.REGEX.EMOJI_SURROGATE.test(word) || word === zeroWidthJoiner) {
            setResult(wordHolder);
            wordHolder = '';
            emojiHolder += word;
        } else {
            setResult(emojiHolder, true);
            emojiHolder = '';
            wordHolder += word;
        }

        if (index === splittedMessage.length - 1) {
            setResult(emojiHolder, true);
            setResult(wordHolder);
        }
    });

    // remove none text characters like '' only return where text is a word or white space ' '
    return _.filter(result, res => res.text);
}

// function getAllEmojiFromText(text) {
//     if (!text) {
//         return [];
//     }

//     const splitText = [];
//     let reResult;
//     let lastMatchIndexEnd = 0;
//     do {
//         // Look for an emoji chunk in the string
//         reResult = CONST.REGEX.EMOJIS.exec(text);

//         // If we reached the end of the string and it wasn't included in a previous match
//         // the chunk between the end of the last match and the end of the string is plain text
//         if (reResult === null && lastMatchIndexEnd !== text.length - 1) {
//             splitText.push({
//                 text: text.slice(lastMatchIndexEnd, text.length),
//                 isEmoji: false,
//             });
//             // eslint-disable-next-line no-continue
//             continue;
//         }

//         const matchIndexStart = reResult.indices[0][0];
//         const matchIndexEnd = reResult.indices[0][1];

//         // The chunk between the end of the last match and the start of the new one is plain-text
//         splitText.push({
//             text: text.slice(lastMatchIndexEnd, matchIndexStart),
//             isEmoji: false,
//         });

//         // Everything captured by the regex itself is emoji + whitespace
//         splitText.push({
//             text: text.slice(matchIndexStart, matchIndexEnd),
//             isEmoji: true,
//         });

//         lastMatchIndexEnd = matchIndexEnd;
//     } while (reResult !== null);

//     return _.filter(splitText, res => res.text);
// }

/**
 * Validates that this message contains has emojis
 *
 * @param {String} message
 * @returns {Boolean}
 */
function hasEmojis(message) {
    const splitText = getAllEmojiFromText(message);
    return _.find(splitText, chunk => chunk.isEmoji) !== undefined;
}

/**
 * Validates that this message contains only emojis
 *
 * @param {String} message
 * @returns {Boolean}
 */
function containsOnlyEmojis(message) {
    const splitText = getAllEmojiFromText(message);
    return _.every(splitText, chunk => chunk.isEmoji);
}

export {
    getHeaderIndices,
    mergeEmojisWithFrequentlyUsedEmojis,
    addToFrequentlyUsedEmojis,
    containsOnlyEmojis,
    replaceEmojis,
    suggestEmojis,
    trimEmojiUnicode,
    getAllEmojiFromText,
    hasEmojis,
};
