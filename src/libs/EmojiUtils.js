"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemovedSkinToneEmoji = exports.getEmojiReactionDetails = exports.getUniqueEmojiCodes = exports.getPreferredEmojiCode = exports.getPreferredSkinToneIndex = exports.getEmojiCodeWithSkinColor = exports.getLocalizedEmojiName = exports.findEmojiByCode = exports.findEmojiByName = void 0;
exports.getProcessedText = getProcessedText;
exports.getHeaderEmojis = getHeaderEmojis;
exports.mergeEmojisWithFrequentlyUsedEmojis = mergeEmojisWithFrequentlyUsedEmojis;
exports.containsOnlyEmojis = containsOnlyEmojis;
exports.replaceEmojis = replaceEmojis;
exports.suggestEmojis = suggestEmojis;
exports.replaceAndExtractEmojis = replaceAndExtractEmojis;
exports.extractEmojis = extractEmojis;
exports.getAddedEmojis = getAddedEmojis;
exports.isFirstLetterEmoji = isFirstLetterEmoji;
exports.hasAccountIDEmojiReacted = hasAccountIDEmojiReacted;
exports.getSpacersIndexes = getSpacersIndexes;
exports.splitTextWithEmojis = splitTextWithEmojis;
var expensify_common_1 = require("expensify-common");
var sortBy_1 = require("lodash/sortBy");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var Emojis = require("@assets/emojis");
var Text_1 = require("@components/Text");
var CONST_1 = require("@src/CONST");
var LOCALES_1 = require("@src/CONST/LOCALES");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var memoize_1 = require("./memoize");
var findEmojiByName = function (name) { return Emojis.emojiNameTable[name]; };
exports.findEmojiByName = findEmojiByName;
var findEmojiByCode = function (code) { return Emojis.emojiCodeTableWithSkinTones[code]; };
exports.findEmojiByCode = findEmojiByCode;
var sortByName = function (emoji, emojiData) { return !emoji.name.includes(emojiData[0].toLowerCase().slice(1)); };
var frequentlyUsedEmojis = [];
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS,
    callback: function (val) {
        var _a;
        if (!val) {
            return;
        }
        frequentlyUsedEmojis =
            (_a = val === null || val === void 0 ? void 0 : val.map(function (item) {
                var emoji = item;
                if (!item.code) {
                    emoji = __assign(__assign({}, emoji), findEmojiByName(item.name));
                }
                if (!item.name) {
                    emoji = __assign(__assign({}, emoji), findEmojiByCode(item.code));
                }
                var emojiWithSkinTones = Emojis.emojiCodeTableWithSkinTones[emoji.code];
                if (!emojiWithSkinTones) {
                    return null;
                }
                return __assign(__assign({}, emojiWithSkinTones), { count: item.count, lastUpdatedAt: item.lastUpdatedAt });
            }).filter(function (emoji) { return !!emoji; })) !== null && _a !== void 0 ? _a : [];
        // On AddComment API response, each variant of the same emoji (with different skin tones) is
        // treated as a separate entry due to unique emoji codes for each variant.
        // So merge duplicate emojis, sum their counts, and use the latest lastUpdatedAt timestamp, then sort accordingly.
        var frequentlyUsedEmojiCodesToObjects = new Map();
        frequentlyUsedEmojis.forEach(function (emoji) {
            var existingEmoji = frequentlyUsedEmojiCodesToObjects.get(emoji.code);
            if (existingEmoji) {
                existingEmoji.count += emoji.count;
                existingEmoji.lastUpdatedAt = Math.max(existingEmoji.lastUpdatedAt, emoji.lastUpdatedAt);
            }
            else {
                frequentlyUsedEmojiCodesToObjects.set(emoji.code, emoji);
            }
        });
        frequentlyUsedEmojis = Array.from(frequentlyUsedEmojiCodesToObjects.values()).sort(function (a, b) {
            if (a.count !== b.count) {
                return b.count - a.count;
            }
            return b.lastUpdatedAt - a.lastUpdatedAt;
        });
    },
});
/**
 * Given an English emoji name, get its localized version
 */
var getLocalizedEmojiName = function (name, locale) {
    var _a, _b, _c, _d, _e;
    var normalizedLocale = locale && (0, LOCALES_1.isFullySupportedLocale)(locale) ? locale : CONST_1.default.LOCALES.EN;
    if (normalizedLocale === CONST_1.default.LOCALES.DEFAULT) {
        return name;
    }
    var emojiCode = (_b = (_a = Emojis.emojiNameTable[name]) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : '';
    return (_e = (_d = (_c = Emojis.localeEmojis[normalizedLocale]) === null || _c === void 0 ? void 0 : _c[emojiCode]) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : '';
};
exports.getLocalizedEmojiName = getLocalizedEmojiName;
/**
 * Get the unicode code of an emoji in base 16.
 */
var getEmojiUnicode = (0, memoize_1.default)(function (input) {
    if (input.length === 0) {
        return '';
    }
    if (input.length === 1) {
        return input
            .charCodeAt(0)
            .toString()
            .split(' ')
            .map(function (val) { return parseInt(val, 10).toString(16); })
            .join(' ');
    }
    var pairs = [];
    // Some Emojis in UTF-16 are stored as a pair of 2 Unicode characters (e.g. Flags)
    // The first char is generally between the range U+D800 to U+DBFF called High surrogate
    // & the second char between the range U+DC00 to U+DFFF called low surrogate
    // More info in the following links:
    // 1. https://docs.microsoft.com/en-us/windows/win32/intl/surrogates-and-supplementary-characters
    // 2. https://thekevinscott.com/emojis-in-javascript/
    for (var i = 0; i < input.length; i++) {
        if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
            // high surrogate
            if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                // low surrogate
                pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
            }
        }
        else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
            // modifiers and joiners
            pairs.push(input.charCodeAt(i));
        }
    }
    return pairs.map(function (val) { return parseInt(String(val), 10).toString(16); }).join(' ');
}, { monitoringName: 'getEmojiUnicode' });
/**
 * Validates first character is emoji in text string
 */
function isFirstLetterEmoji(message) {
    var trimmedMessage = expensify_common_1.Str.replaceAll(message.replace(/ /g, ''), '\n', '');
    var match = trimmedMessage.match(CONST_1.default.REGEX.ALL_EMOJIS);
    if (!match) {
        return false;
    }
    return trimmedMessage.startsWith(match[0]);
}
/**
 * Validates that this message contains only emojis
 */
function containsOnlyEmojis(message) {
    var trimmedMessage = expensify_common_1.Str.replaceAll(message.replace(/ /g, ''), '\n', '');
    var match = trimmedMessage.match(CONST_1.default.REGEX.ALL_EMOJIS);
    if (!match) {
        return false;
    }
    var codes = [];
    match.map(function (emoji) {
        return getEmojiUnicode(emoji)
            .split(' ')
            .map(function (code) {
            if (!CONST_1.default.INVISIBLE_CODEPOINTS.includes(code)) {
                codes.push(code);
            }
            return code;
        });
    });
    // Emojis are stored as multiple characters, so we're using spread operator
    // to iterate over the actual emojis, not just characters that compose them
    var messageCodes = __spreadArray([], trimmedMessage, true).map(function (char) { return getEmojiUnicode(char); })
        .filter(function (string) { return string.length > 0 && !CONST_1.default.INVISIBLE_CODEPOINTS.includes(string); });
    return codes.length === messageCodes.length;
}
/**
 * Get the header emojis with their code, icon and index
 */
function getHeaderEmojis(emojis) {
    var headerIndices = [];
    emojis.forEach(function (emoji, index) {
        if (!('header' in emoji)) {
            return;
        }
        headerIndices.push({ code: emoji.code, index: index, icon: emoji.icon });
    });
    return headerIndices;
}
/**
 * Get number of empty spaces to be filled to get equal emojis for every row
 */
function getDynamicSpacing(emojiCount, suffix) {
    var spacerEmojis = [];
    var modLength = CONST_1.default.EMOJI_NUM_PER_ROW - (emojiCount % CONST_1.default.EMOJI_NUM_PER_ROW);
    // Empty spaces is pushed if the given row has less than eight emojis
    while (modLength > 0 && modLength < CONST_1.default.EMOJI_NUM_PER_ROW) {
        spacerEmojis.push({
            code: "".concat(CONST_1.default.EMOJI_SPACER, "_").concat(suffix, "_").concat(modLength),
            spacer: true,
        });
        modLength -= 1;
    }
    return spacerEmojis;
}
/**
 * Add dynamic spaces to emoji categories
 */
function addSpacesToEmojiCategories(emojis) {
    var updatedEmojis = [];
    emojis.forEach(function (emoji, index) {
        if (emoji && typeof emoji === 'object' && 'header' in emoji) {
            updatedEmojis = updatedEmojis.concat(getDynamicSpacing(updatedEmojis.length, index), [emoji], getDynamicSpacing(1, index));
            return;
        }
        updatedEmojis.push(emoji);
    });
    return updatedEmojis;
}
/**
 * Get a merged array with frequently used emojis
 */
function mergeEmojisWithFrequentlyUsedEmojis(emojis) {
    if (frequentlyUsedEmojis.length === 0) {
        return addSpacesToEmojiCategories(emojis);
    }
    var formattedFrequentlyUsedEmojis = frequentlyUsedEmojis.map(function (frequentlyUsedEmoji) {
        // Frequently used emojis in the old format will have name/types/code stored with them
        // The back-end may not always have both, so we'll need to fill them in.
        if (!('code' in frequentlyUsedEmoji)) {
            return findEmojiByName(frequentlyUsedEmoji.name);
        }
        if (!('name' in frequentlyUsedEmoji)) {
            return findEmojiByCode(frequentlyUsedEmoji.code);
        }
        return frequentlyUsedEmoji;
    });
    var mergedEmojis = __spreadArray(__spreadArray([Emojis.categoryFrequentlyUsed], formattedFrequentlyUsedEmojis, true), emojis, true);
    return addSpacesToEmojiCategories(mergedEmojis);
}
/**
 * Given an emoji item object, return an emoji code based on its type.
 */
var getEmojiCodeWithSkinColor = function (item, preferredSkinToneIndex) {
    var _a;
    var code = item.code, types = item.types;
    if (typeof preferredSkinToneIndex === 'number' && (types === null || types === void 0 ? void 0 : types[preferredSkinToneIndex])) {
        return (_a = types.at(preferredSkinToneIndex)) !== null && _a !== void 0 ? _a : '';
    }
    return code;
};
exports.getEmojiCodeWithSkinColor = getEmojiCodeWithSkinColor;
/**
 * Extracts emojis from a given text.
 *
 * @param text - The text to extract emojis from.
 * @returns An array of emoji codes.
 */
function extractEmojis(text) {
    if (!text) {
        return [];
    }
    // Parse Emojis including skin tones - Eg: ['👩🏻', '👩🏻', '👩🏼', '👩🏻', '👩🏼', '👩']
    var parsedEmojis = text.match(CONST_1.default.REGEX.ALL_EMOJIS);
    if (!parsedEmojis) {
        return [];
    }
    var emojis = [];
    // Text can contain similar emojis as well as their skin tone variants. Create a Set to remove duplicate emojis from the search.
    for (var _i = 0, parsedEmojis_1 = parsedEmojis; _i < parsedEmojis_1.length; _i++) {
        var character = parsedEmojis_1[_i];
        var emoji = Emojis.emojiCodeTableWithSkinTones[character];
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
function getAddedEmojis(currentEmojis, formerEmojis) {
    var newEmojis = __spreadArray([], currentEmojis, true);
    // We are removing the emojis from the newEmojis array if they were already present before.
    formerEmojis.forEach(function (formerEmoji) {
        var indexOfAlreadyPresentEmoji = newEmojis.findIndex(function (newEmoji) { return newEmoji.code === formerEmoji.code; });
        if (indexOfAlreadyPresentEmoji >= 0) {
            newEmojis.splice(indexOfAlreadyPresentEmoji, 1);
        }
    });
    return newEmojis;
}
/**
 * Replace any emoji name in a text with the emoji icon.
 * If we're on mobile, we also add a space after the emoji granted there's no text after it.
 */
function replaceEmojis(text, preferredSkinTone, locale) {
    var _a, _b, _c, _d, _e;
    if (preferredSkinTone === void 0) { preferredSkinTone = CONST_1.default.EMOJI_DEFAULT_SKIN_TONE; }
    if (locale === void 0) { locale = CONST_1.default.LOCALES.DEFAULT; }
    // emojisTrie is importing the emoji JSON file on the app starting and we want to avoid it
    var emojisTrie = require('./EmojiTrie').default;
    var normalizedLocale = locale && (0, LOCALES_1.isFullySupportedLocale)(locale) ? locale : CONST_1.default.LOCALES.EN;
    var trie = emojisTrie[normalizedLocale];
    if (!trie) {
        return { text: text, emojis: [] };
    }
    var newText = text;
    var emojis = [];
    var emojiData = text.match(CONST_1.default.REGEX.EMOJI_NAME);
    if (!emojiData || emojiData.length === 0) {
        return { text: newText, emojis: emojis };
    }
    var cursorPosition;
    for (var _i = 0, emojiData_1 = emojiData; _i < emojiData_1.length; _i++) {
        var emoji = emojiData_1[_i];
        var name_1 = emoji.slice(1, -1);
        var checkEmoji = trie.search(name_1);
        // If the user has selected a language other than English, and the emoji doesn't exist in that language,
        // we will check if the emoji exists in English.
        if (normalizedLocale !== CONST_1.default.LOCALES.DEFAULT && !((_a = checkEmoji === null || checkEmoji === void 0 ? void 0 : checkEmoji.metaData) === null || _a === void 0 ? void 0 : _a.code)) {
            var englishTrie = emojisTrie[CONST_1.default.LOCALES.DEFAULT];
            if (englishTrie) {
                checkEmoji = englishTrie.search(name_1);
            }
        }
        if (((_b = checkEmoji === null || checkEmoji === void 0 ? void 0 : checkEmoji.metaData) === null || _b === void 0 ? void 0 : _b.code) && ((_c = checkEmoji === null || checkEmoji === void 0 ? void 0 : checkEmoji.metaData) === null || _c === void 0 ? void 0 : _c.name)) {
            var emojiReplacement = getEmojiCodeWithSkinColor(checkEmoji.metaData, preferredSkinTone);
            emojis.push({
                name: name_1,
                code: (_d = checkEmoji.metaData) === null || _d === void 0 ? void 0 : _d.code,
                types: checkEmoji.metaData.types,
            });
            // Set the cursor to the end of the last replaced Emoji. Note that we position after
            // the extra space, if we added one.
            cursorPosition = newText.indexOf(emoji) + ((_e = emojiReplacement === null || emojiReplacement === void 0 ? void 0 : emojiReplacement.length) !== null && _e !== void 0 ? _e : 0);
            newText = newText.replace(emoji, emojiReplacement !== null && emojiReplacement !== void 0 ? emojiReplacement : '');
        }
    }
    // cursorPosition, when not undefined, points to the end of the last emoji that was replaced.
    // In that case we want to append a space at the cursor position, but only if the next character
    // is not already a space (to avoid double spaces).
    if (cursorPosition && cursorPosition > 0) {
        var space = ' ';
        if (newText.charAt(cursorPosition) !== space) {
            newText = newText.slice(0, cursorPosition) + space + newText.slice(cursorPosition);
        }
        cursorPosition += space.length;
    }
    return { text: newText, emojis: emojis, cursorPosition: cursorPosition };
}
/**
 * Find all emojis in a text and replace them with their code.
 */
function replaceAndExtractEmojis(text, preferredSkinTone, locale) {
    if (preferredSkinTone === void 0) { preferredSkinTone = CONST_1.default.EMOJI_DEFAULT_SKIN_TONE; }
    if (locale === void 0) { locale = CONST_1.default.LOCALES.DEFAULT; }
    var normalizedLocale = locale && (0, LOCALES_1.isFullySupportedLocale)(locale) ? locale : CONST_1.default.LOCALES.EN;
    var _a = replaceEmojis(text, preferredSkinTone, normalizedLocale), _b = _a.text, convertedText = _b === void 0 ? '' : _b, _c = _a.emojis, emojis = _c === void 0 ? [] : _c, cursorPosition = _a.cursorPosition;
    return {
        text: convertedText,
        emojis: emojis.concat(extractEmojis(text)),
        cursorPosition: cursorPosition,
    };
}
/**
 * Suggest emojis when typing emojis prefix after colon
 * @param [limit] - matching emojis limit
 */
function suggestEmojis(text, locale, limit) {
    var _a;
    if (locale === void 0) { locale = CONST_1.default.LOCALES.DEFAULT; }
    if (limit === void 0) { limit = CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS; }
    // emojisTrie is importing the emoji JSON file on the app starting and we want to avoid it
    var emojisTrie = require('./EmojiTrie').default;
    var normalizedLocale = locale && (0, LOCALES_1.isFullySupportedLocale)(locale) ? locale : CONST_1.default.LOCALES.EN;
    var trie = emojisTrie[normalizedLocale];
    if (!trie) {
        return [];
    }
    var emojiData = text.match(CONST_1.default.REGEX.EMOJI_SUGGESTIONS);
    if (!emojiData) {
        return [];
    }
    var matching = [];
    var nodes = trie.getAllMatchingWords(emojiData[0].toLowerCase().slice(1), limit);
    var _loop_1 = function (node) {
        if (((_a = node.metaData) === null || _a === void 0 ? void 0 : _a.code) && !matching.find(function (obj) { return obj.name === node.name; })) {
            if (matching.length === limit) {
                return { value: (0, sortBy_1.default)(matching, function (emoji) { return sortByName(emoji, emojiData); }) };
            }
            matching.push({ code: node.metaData.code, name: node.name, types: node.metaData.types });
        }
        var suggestions = node.metaData.suggestions;
        if (!suggestions) {
            return { value: void 0 };
        }
        var _loop_2 = function (suggestion) {
            if (matching.length === limit) {
                return { value: (0, sortBy_1.default)(matching, function (emoji) { return sortByName(emoji, emojiData); }) };
            }
            if (!matching.find(function (obj) { return obj.name === suggestion.name; })) {
                matching.push(__assign({}, suggestion));
            }
        };
        for (var _b = 0, suggestions_1 = suggestions; _b < suggestions_1.length; _b++) {
            var suggestion = suggestions_1[_b];
            var state_2 = _loop_2(suggestion);
            if (typeof state_2 === "object")
                return state_2;
        }
    };
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        var state_1 = _loop_1(node);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return (0, sortBy_1.default)(matching, function (emoji) { return sortByName(emoji, emojiData); });
}
/**
 * Retrieve preferredSkinTone as Number to prevent legacy 'default' String value
 */
var getPreferredSkinToneIndex = function (value) {
    if (value !== null && Number.isInteger(Number(value))) {
        return Number(value);
    }
    return CONST_1.default.EMOJI_DEFAULT_SKIN_TONE;
};
exports.getPreferredSkinToneIndex = getPreferredSkinToneIndex;
/**
 * Given an emoji object it returns the correct emoji code
 * based on the users preferred skin tone.
 */
var getPreferredEmojiCode = function (emoji, preferredSkinTone) {
    if (emoji.types && typeof preferredSkinTone === 'number') {
        var emojiCodeWithSkinTone = preferredSkinTone >= 0 ? emoji.types.at(preferredSkinTone) : undefined;
        // Note: it can happen that preferredSkinTone has a outdated format,
        // so it makes sense to check if we actually got a valid emoji code back
        if (emojiCodeWithSkinTone) {
            return emojiCodeWithSkinTone;
        }
    }
    return emoji.code;
};
exports.getPreferredEmojiCode = getPreferredEmojiCode;
/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji, sorted by the reaction timestamp.
 */
var getUniqueEmojiCodes = function (emojiAsset, users) {
    var emojiCodes = Object.values(users !== null && users !== void 0 ? users : {}).reduce(function (result, userSkinTones) {
        var _a;
        Object.keys((_a = userSkinTones === null || userSkinTones === void 0 ? void 0 : userSkinTones.skinTones) !== null && _a !== void 0 ? _a : {}).forEach(function (skinTone) {
            var createdAt = userSkinTones.skinTones[Number(skinTone)];
            var emojiCode = getPreferredEmojiCode(emojiAsset, Number(skinTone));
            if (!!emojiCode && (!result[emojiCode] || createdAt < result[emojiCode])) {
                // eslint-disable-next-line no-param-reassign
                result[emojiCode] = createdAt;
            }
        });
        return result;
    }, {});
    return Object.keys(emojiCodes !== null && emojiCodes !== void 0 ? emojiCodes : {}).sort(function (a, b) { return (new Date(emojiCodes[a]) > new Date(emojiCodes[b]) ? 1 : -1); });
};
exports.getUniqueEmojiCodes = getUniqueEmojiCodes;
/**
 * Given an emoji reaction object and its name, it populates it with the oldest reaction timestamps.
 */
var enrichEmojiReactionWithTimestamps = function (emoji, emojiName) {
    var _a;
    var oldestEmojiTimestamp = null;
    var usersWithTimestamps = {};
    Object.entries((_a = emoji.users) !== null && _a !== void 0 ? _a : {}).forEach(function (_a) {
        var _b;
        var id = _a[0], user = _a[1];
        var userTimestamps = Object.values((_b = user === null || user === void 0 ? void 0 : user.skinTones) !== null && _b !== void 0 ? _b : {});
        var oldestUserTimestamp = userTimestamps.reduce(function (min, curr) {
            if (min) {
                return curr < min ? curr : min;
            }
            return curr;
        }, userTimestamps.at(0));
        if (!oldestUserTimestamp) {
            return;
        }
        if (!oldestEmojiTimestamp || oldestUserTimestamp < oldestEmojiTimestamp) {
            oldestEmojiTimestamp = oldestUserTimestamp;
        }
        usersWithTimestamps[id] = __assign(__assign({}, user), { id: id, oldestTimestamp: oldestUserTimestamp });
    });
    return __assign(__assign({}, emoji), { users: usersWithTimestamps, 
        // Just in case two emojis have the same timestamp, also combine the timestamp with the
        // emojiName so that the order will always be the same. Without this, the order can be pretty random
        // and shift around a little bit.
        oldestTimestamp: (oldestEmojiTimestamp !== null && oldestEmojiTimestamp !== void 0 ? oldestEmojiTimestamp : emoji.createdAt) + emojiName });
};
/**
 * Returns true if the accountID has reacted to the report action (with the given skin tone).
 * Uses the NEW FORMAT for "emojiReactions"
 * @param usersReactions - all the users reactions
 */
function hasAccountIDEmojiReacted(accountID, usersReactions, skinTone) {
    var _a;
    if (skinTone === undefined) {
        return !!usersReactions[accountID];
    }
    var userReaction = usersReactions[accountID];
    if (!(userReaction === null || userReaction === void 0 ? void 0 : userReaction.skinTones) || !Object.values((_a = userReaction === null || userReaction === void 0 ? void 0 : userReaction.skinTones) !== null && _a !== void 0 ? _a : {}).length) {
        return false;
    }
    return !!userReaction.skinTones[skinTone];
}
/**
 * Given an emoji reaction and current user's account ID, it returns the reusable details of the emoji reaction.
 */
var getEmojiReactionDetails = function (emojiName, reaction, currentUserAccountID) {
    var _a = enrichEmojiReactionWithTimestamps(reaction, emojiName), users = _a.users, oldestTimestamp = _a.oldestTimestamp;
    var emoji = findEmojiByName(emojiName);
    var emojiCodes = getUniqueEmojiCodes(emoji, users);
    var reactionCount = Object.values(users !== null && users !== void 0 ? users : {})
        .map(function (user) { var _a; return Object.values((_a = user === null || user === void 0 ? void 0 : user.skinTones) !== null && _a !== void 0 ? _a : {}).length; })
        .reduce(function (sum, curr) { return sum + curr; }, 0);
    var hasUserReacted = hasAccountIDEmojiReacted(currentUserAccountID, users);
    var userAccountIDs = Object.values(users !== null && users !== void 0 ? users : {})
        .sort(function (a, b) { return (a.oldestTimestamp > b.oldestTimestamp ? 1 : -1); })
        .map(function (user) { return Number(user.id); });
    return {
        emoji: emoji,
        emojiCodes: emojiCodes,
        reactionCount: reactionCount,
        hasUserReacted: hasUserReacted,
        userAccountIDs: userAccountIDs,
        oldestTimestamp: oldestTimestamp,
    };
};
exports.getEmojiReactionDetails = getEmojiReactionDetails;
/**
 * Given an emoji code, returns an base emoji code without skin tone
 */
var getRemovedSkinToneEmoji = function (emoji) { return emoji === null || emoji === void 0 ? void 0 : emoji.replace(CONST_1.default.REGEX.EMOJI_SKIN_TONES, ''); };
exports.getRemovedSkinToneEmoji = getRemovedSkinToneEmoji;
function getSpacersIndexes(allEmojis) {
    var spacersIndexes = [];
    allEmojis.forEach(function (emoji, index) {
        if (!(CONST_1.default.EMOJI_PICKER_ITEM_TYPES.SPACER in emoji)) {
            return;
        }
        spacersIndexes.push(index);
    });
    return spacersIndexes;
}
/** Splits the text with emojis into array if emojis exist in the text */
function splitTextWithEmojis(text) {
    if (text === void 0) { text = ''; }
    if (!text) {
        return [];
    }
    var doesTextContainEmojis = new RegExp(CONST_1.default.REGEX.EMOJIS, CONST_1.default.REGEX.EMOJIS.flags.concat('g')).test(text);
    if (!doesTextContainEmojis) {
        return [];
    }
    // The regex needs to be cloned because `exec()` is a stateful operation and maintains the state inside
    // the regex variable itself, so we must have an independent instance for each function's call.
    var emojisRegex = new RegExp(CONST_1.default.REGEX.EMOJIS, CONST_1.default.REGEX.EMOJIS.flags.concat('g'));
    var splitText = [];
    var regexResult;
    var lastMatchIndexEnd = 0;
    do {
        regexResult = emojisRegex.exec(text);
        if (regexResult === null || regexResult === void 0 ? void 0 : regexResult.indices) {
            var matchIndexStart = regexResult.indices[0][0];
            var matchIndexEnd = regexResult.indices[0][1];
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
function getProcessedText(processedTextArray, style) {
    return processedTextArray.map(function (_a, index) {
        var text = _a.text, isEmoji = _a.isEmoji;
        return isEmoji ? (<Text_1.default 
        // eslint-disable-next-line react/no-array-index-key
        key={index} style={style}>
                {text}
            </Text_1.default>) : (text);
    });
}
