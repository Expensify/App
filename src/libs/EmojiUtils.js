import _ from 'underscore';
import {getUnixTime} from 'date-fns';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashMin from 'lodash/min';
import lodashSum from 'lodash/sum';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import emojisTrie from './EmojiTrie';
import * as Emojis from '../../assets/emojis';

let frequentlyUsedEmojis = [];
Onyx.connect({
    key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
    callback: (val) => {
        frequentlyUsedEmojis = _.map(val, (item) => {
            const emoji = Emojis.emojiCodeTableWithSkinTones[item.code];
            if (emoji) {
                return {...emoji, count: item.count, lastUpdatedAt: item.lastUpdatedAt};
            }
        });
    },
});

/**
 *
 * @param {String} name
 * @returns {Object}
 */
const findEmojiByName = (name) => Emojis.emojiNameTable[name];

/**
 *
 * @param {String} code
 * @returns {Object}
 */
const findEmojiByCode = (code) => Emojis.emojiCodeTableWithSkinTones[code];

/**
 *
 * @param {Object} emoji
 * @param {String} lang
 * @returns {String}
 */
const getEmojiName = (emoji, lang = CONST.LOCALES.DEFAULT) => {
    if (lang === CONST.LOCALES.DEFAULT) {
        return emoji.name;
    }

    return _.get(Emojis.localeEmojis, [lang, emoji.code, 'name'], '');
};

/**
 * Given an English emoji name, get its localized version
 *
 * @param {String} name
 * @param {String} lang
 * @returns {String}
 */
const getLocalizedEmojiName = (name, lang) => {
    if (lang === CONST.LOCALES.DEFAULT) {
        return name;
    }

    return _.get(Emojis.localeEmojis, [lang, _.get(Emojis.emojiNameTable, [name, 'code'], ''), 'name'], '');
};

/**
 * Get the unicode code of an emoji in base 16.
 * @param {String} input
 * @returns {String}
 */
const getEmojiUnicode = _.memoize((input) => {
    if (input.length === 0) {
        return '';
    }

    if (input.length === 1) {
        return _.map(input.charCodeAt(0).toString().split(' '), (val) => parseInt(val, 10).toString(16)).join(' ');
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
    return _.map(pairs, (val) => parseInt(val, 10).toString(16)).join(' ');
});

/**
 * Function to remove Skin Tone and utf16 surrogates from Emoji
 * @param {String} emojiCode
 * @returns {String}
 */
function trimEmojiUnicode(emojiCode) {
    return emojiCode.replace(/(fe0f|1f3fb|1f3fc|1f3fd|1f3fe|1f3ff)$/, '').trim();
}

/**
 * Validates first character is emoji in text string
 *
 * @param {String} message
 * @returns {Boolean}
 */
function isFirstLetterEmoji(message) {
    const trimmedMessage = Str.replaceAll(message.replace(/ /g, ''), '\n', '');
    const match = trimmedMessage.match(CONST.REGEX.EMOJIS);

    if (!match) {
        return false;
    }

    return trimmedMessage.indexOf(match[0]) === 0;
}

/**
 * Validates that this message contains only emojis
 *
 * @param {String} message
 * @returns {Boolean}
 */
function containsOnlyEmojis(message) {
    const trimmedMessage = Str.replaceAll(message.replace(/ /g, ''), '\n', '');
    const match = trimmedMessage.match(CONST.REGEX.EMOJIS);

    if (!match) {
        return false;
    }

    const codes = [];
    _.map(match, (emoji) =>
        _.map(getEmojiUnicode(emoji).split(' '), (code) => {
            if (!CONST.INVISIBLE_CODEPOINTS.includes(code)) {
                codes.push(code);
            }
            return code;
        }),
    );

    // Emojis are stored as multiple characters, so we're using spread operator
    // to iterate over the actual emojis, not just characters that compose them
    const messageCodes = _.filter(
        _.map([...trimmedMessage], (char) => getEmojiUnicode(char)),
        (string) => string.length > 0 && !CONST.INVISIBLE_CODEPOINTS.includes(string),
    );
    return codes.length === messageCodes.length;
}

/**
 * Get the header emojis with their code, icon and index
 * @param {Object[]} emojis
 * @returns {Object[]}
 */
function getHeaderEmojis(emojis) {
    const headerIndices = [];
    _.each(emojis, (emoji, index) => {
        if (!emoji.header) {
            return;
        }
        headerIndices.push({code: emoji.code, index, icon: emoji.icon});
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
 * @returns {Object[]}
 */
function mergeEmojisWithFrequentlyUsedEmojis(emojis) {
    if (frequentlyUsedEmojis.length === 0) {
        return addSpacesToEmojiCategories(emojis);
    }

    const mergedEmojis = [Emojis.categoryFrequentlyUsed].concat(frequentlyUsedEmojis, emojis);
    return addSpacesToEmojiCategories(mergedEmojis);
}

/**
 * Get the updated frequently used emojis list by usage
 * @param {Object|Object[]} newEmoji
 * @return {Object[]}
 */
function getFrequentlyUsedEmojis(newEmoji) {
    let frequentEmojiList = [...frequentlyUsedEmojis];

    const maxFrequentEmojiCount = CONST.EMOJI_FREQUENT_ROW_COUNT * CONST.EMOJI_NUM_PER_ROW - 1;
    const currentTimestamp = getUnixTime(new Date());
    _.each([].concat(newEmoji), (emoji) => {
        let currentEmojiCount = 1;
        const emojiIndex = _.findIndex(frequentEmojiList, (e) => e.code === emoji.code);
        if (emojiIndex >= 0) {
            currentEmojiCount = frequentEmojiList[emojiIndex].count + 1;
            frequentEmojiList.splice(emojiIndex, 1);
        }

        const updatedEmoji = {...Emojis.emojiCodeTableWithSkinTones[emoji.code], count: currentEmojiCount, lastUpdatedAt: currentTimestamp};

        // We want to make sure the current emoji is added to the list
        // Hence, we take one less than the current frequent used emojis
        frequentEmojiList = frequentEmojiList.slice(0, maxFrequentEmojiCount);
        frequentEmojiList.push(updatedEmoji);

        // Sort the list by count and lastUpdatedAt in descending order
        frequentEmojiList.sort((a, b) => b.count - a.count || b.lastUpdatedAt - a.lastUpdatedAt);
    });

    return frequentEmojiList;
}

/**
 * Given an emoji item object, return an emoji code based on its type.
 *
 * @param {Object} item
 * @param {Number} preferredSkinToneIndex
 * @returns {String}
 */
const getEmojiCodeWithSkinColor = (item, preferredSkinToneIndex) => {
    const {code, types} = item;
    if (types && types[preferredSkinToneIndex]) {
        return types[preferredSkinToneIndex];
    }

    return code;
};

/**
 * Extracts emojis from a given text.
 *
 * @param {String} text - The text to extract emojis from.
 * @returns {Object[]} An array of emoji codes.
 */
function extractEmojis(text) {
    if (!text) {
        return [];
    }

    // Parse Emojis including skin tones - Eg: ['👩🏻', '👩🏻', '👩🏼', '👩🏻', '👩🏼', '👩']
    const parsedEmojis = text.match(CONST.REGEX.EMOJIS);

    if (!parsedEmojis) {
        return [];
    }

    const emojis = [];
    for (let i = 0; i < parsedEmojis.length; i++) {
        const character = parsedEmojis[i];
        const emoji = Emojis.emojiCodeTableWithSkinTones[character];
        if (emoji) {
            emojis.push(emoji);
        }
    }

    return emojis;
}

/**
 * Take the current emojis and the former emojis and return the emojis that were added, if we add an already existing emoji, we also return it
 * @param {Object[]} currentEmojis The array of current emojis
 * @param {Object[]} formerEmojis The array of former emojis
 * @returns {Object[]} The array of added emojis
 */
function getAddedEmojis(currentEmojis, formerEmojis) {
    const newEmojis = [...currentEmojis];
    // We are removing the emojis from the newEmojis array if they were already present before.
    formerEmojis.forEach((formerEmoji) => {
        const indexOfAlreadyPresentEmoji = _.findIndex(newEmojis, (newEmoji) => newEmoji.code === formerEmoji.code);
        if (indexOfAlreadyPresentEmoji >= 0) {
            newEmojis.splice(indexOfAlreadyPresentEmoji, 1);
        }
    });
    return newEmojis;
}

/**
 * Replace any emoji name in a text with the emoji icon.
 * If we're on mobile, we also add a space after the emoji granted there's no text after it.
 *
 * @param {String} text
 * @param {Number} preferredSkinTone
 * @param {String} lang
 * @returns {Object}
 */
function replaceEmojis(text, preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE, lang = CONST.LOCALES.DEFAULT) {
    const trie = emojisTrie[lang];
    if (!trie) {
        return {text, emojis: []};
    }

    let newText = text;
    const emojis = [];
    const emojiData = text.match(CONST.REGEX.EMOJI_NAME);
    if (!emojiData || emojiData.length === 0) {
        return {text: newText, emojis};
    }
    for (let i = 0; i < emojiData.length; i++) {
        const name = emojiData[i].slice(1, -1);
        let checkEmoji = trie.search(name);
        // If the user has selected a language other than English, and the emoji doesn't exist in that language,
        // we will check if the emoji exists in English.
        if (lang !== CONST.LOCALES.DEFAULT && (!checkEmoji || !checkEmoji.metaData.code)) {
            const englishTrie = emojisTrie[CONST.LOCALES.DEFAULT];
            if (englishTrie) {
                const englishEmoji = englishTrie.search(name);
                checkEmoji = englishEmoji;
            }
        }
        if (checkEmoji && checkEmoji.metaData.code) {
            let emojiReplacement = getEmojiCodeWithSkinColor(checkEmoji.metaData, preferredSkinTone);
            emojis.push({
                name,
                code: checkEmoji.metaData.code,
                types: checkEmoji.metaData.types,
            });

            // If this is the last emoji in the message and it's the end of the message so far,
            // add a space after it so the user can keep typing easily.
            if (i === emojiData.length - 1) {
                emojiReplacement += ' ';
            }

            newText = newText.replace(emojiData[i], emojiReplacement);
        }
    }

    return {text: newText, emojis};
}

/**
 * Find all emojis in a text and replace them with their code.
 * @param {String} text
 * @param {Number} preferredSkinTone
 * @param {String} lang
 * @returns {Object}
 */
function replaceAndExtractEmojis(text, preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE, lang = CONST.LOCALES.DEFAULT) {
    const {text: convertedText = '', emojis = []} = replaceEmojis(text, preferredSkinTone, lang);

    return {
        text: convertedText,
        emojis: emojis.concat(extractEmojis(text)),
    };
}

/**
 * Suggest emojis when typing emojis prefix after colon
 * @param {String} text
 * @param {String} lang
 * @param {Number} [limit] - matching emojis limit
 * @returns {Array}
 */
function suggestEmojis(text, lang, limit = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS) {
    const trie = emojisTrie[lang];
    if (!trie) {
        return [];
    }

    const emojiData = text.match(CONST.REGEX.EMOJI_SUGGESTIONS);
    if (!emojiData) {
        return [];
    }

    const matching = [];
    const nodes = trie.getAllMatchingWords(emojiData[0].toLowerCase().slice(1), limit);
    for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].metaData.code && !_.find(matching, (obj) => obj.name === nodes[j].name)) {
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

            const suggestion = suggestions[i];
            if (!_.find(matching, (obj) => obj.name === suggestion.name)) {
                matching.push({...suggestion});
            }
        }
    }
    return matching;
}

/**
 * Retrieve preferredSkinTone as Number to prevent legacy 'default' String value
 *
 * @param {Number | String} val
 * @returns {Number}
 */
const getPreferredSkinToneIndex = (val) => {
    if (!_.isNull(val) && !_.isUndefined(val) && Number.isInteger(Number(val))) {
        return val;
    }

    return CONST.EMOJI_DEFAULT_SKIN_TONE;
};

/**
 * Given an emoji object it returns the correct emoji code
 * based on the users preferred skin tone.
 * @param {Object} emoji
 * @param {String | Number} preferredSkinTone
 * @returns {String}
 */
const getPreferredEmojiCode = (emoji, preferredSkinTone) => {
    if (emoji.types) {
        const emojiCodeWithSkinTone = emoji.types[preferredSkinTone];

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
 * @param {Object} emojiAsset
 * @param {String} emojiAsset.name
 * @param {String} emojiAsset.code
 * @param {String[]} [emojiAsset.types]
 * @param {Array} users
 * @return {string[]}
 * */
const getUniqueEmojiCodes = (emojiAsset, users) => {
    const emojiCodes = _.reduce(
        users,
        (result, userSkinTones) => {
            _.each(lodashGet(userSkinTones, 'skinTones'), (createdAt, skinTone) => {
                const emojiCode = getPreferredEmojiCode(emojiAsset, skinTone);
                if (!!emojiCode && (!result[emojiCode] || createdAt < result[emojiCode])) {
                    // eslint-disable-next-line no-param-reassign
                    result[emojiCode] = createdAt;
                }
            });
            return result;
        },
        {},
    );

    return _.chain(emojiCodes)
        .pairs()
        .sortBy((entry) => new Date(entry[1])) // Sort by values (timestamps)
        .map((entry) => entry[0]) // Extract keys (emoji codes)
        .value();
};

/**
 * Given an emoji reaction object and its name, it populates it with the oldest reaction timestamps.
 * @param {Object} emoji
 * @param {String} emojiName
 * @returns {Object}
 */
const enrichEmojiReactionWithTimestamps = (emoji, emojiName) => {
    let oldestEmojiTimestamp = null;

    const usersWithTimestamps = _.chain(emoji.users)
        .pick(_.identity)
        .mapObject((user, id) => {
            const oldestUserTimestamp = lodashMin(_.values(user.skinTones));

            if (!oldestEmojiTimestamp || oldestUserTimestamp < oldestEmojiTimestamp) {
                oldestEmojiTimestamp = oldestUserTimestamp;
            }

            return {
                ...user,
                id,
                oldestTimestamp: oldestUserTimestamp,
            };
        })
        .value();

    return {
        ...emoji,
        users: usersWithTimestamps,
        // Just in case two emojis have the same timestamp, also combine the timestamp with the
        // emojiName so that the order will always be the same. Without this, the order can be pretty random
        // and shift around a little bit.
        oldestTimestamp: (oldestEmojiTimestamp || emoji.createdAt) + emojiName,
    };
};

/**
 * Returns true if the accountID has reacted to the report action (with the given skin tone).
 * Uses the NEW FORMAT for "emojiReactions"
 * @param {String} accountID
 * @param {Array<Object | String | number>} usersReactions - all the users reactions
 * @param {Number} [skinTone]
 * @returns {boolean}
 */
function hasAccountIDEmojiReacted(accountID, usersReactions, skinTone) {
    if (_.isUndefined(skinTone)) {
        return Boolean(usersReactions[accountID]);
    }
    const userReaction = usersReactions[accountID];
    if (!userReaction || !userReaction.skinTones || !_.size(userReaction.skinTones)) {
        return false;
    }
    return Boolean(userReaction.skinTones[skinTone]);
}

/**
 * Given an emoji reaction and current user's account ID, it returns the reusable details of the emoji reaction.
 * @param {String} emojiName
 * @param {Object} reaction
 * @param {String} currentUserAccountID
 * @returns {Object}
 */
const getEmojiReactionDetails = (emojiName, reaction, currentUserAccountID) => {
    const {users, oldestTimestamp} = enrichEmojiReactionWithTimestamps(reaction, emojiName);

    const emoji = findEmojiByName(emojiName);
    const emojiCodes = getUniqueEmojiCodes(emoji, users);
    const reactionCount = lodashSum(_.map(users, (user) => _.size(user.skinTones)));
    const hasUserReacted = hasAccountIDEmojiReacted(currentUserAccountID, users);
    const userAccountIDs = _.chain(users)
        .sortBy('oldestTimestamp')
        .map((user) => Number(user.id))
        .value();

    return {
        emoji,
        emojiCodes,
        reactionCount,
        hasUserReacted,
        userAccountIDs,
        oldestTimestamp,
    };
};

export {
    findEmojiByName,
    findEmojiByCode,
    getEmojiName,
    getLocalizedEmojiName,
    getHeaderEmojis,
    mergeEmojisWithFrequentlyUsedEmojis,
    getFrequentlyUsedEmojis,
    containsOnlyEmojis,
    replaceEmojis,
    suggestEmojis,
    trimEmojiUnicode,
    getEmojiCodeWithSkinColor,
    getPreferredSkinToneIndex,
    getPreferredEmojiCode,
    getUniqueEmojiCodes,
    getEmojiReactionDetails,
    replaceAndExtractEmojis,
    extractEmojis,
    getAddedEmojis,
    isFirstLetterEmoji,
    hasAccountIDEmojiReacted,
};
