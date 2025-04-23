'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.buildEmojisTrie = void 0;
var emojis_1 = require('@assets/emojis');
var CONST_1 = require('@src/CONST');
var Timing_1 = require('./actions/Timing');
var StringUtils_1 = require('./StringUtils');
var Trie_1 = require('./Trie');
var supportedLanguages = [CONST_1['default'].LOCALES.DEFAULT, CONST_1['default'].LOCALES.ES];
/**
 *
 * @param trie The Trie object.
 * @param keywords An array containing the keywords.
 * @param item An object containing the properties of the emoji.
 * @param name The localized name of the emoji.
 * @param shouldPrependKeyword Prepend the keyword (instead of append) to the suggestions
 */
function addKeywordsToTrie(trie, keywords, item, name, shouldPrependKeyword) {
    if (shouldPrependKeyword === void 0) {
        shouldPrependKeyword = false;
    }
    keywords.forEach(function (keyword) {
        var _a, _b;
        var keywordNode = trie.search(keyword);
        var normalizedKeyword = StringUtils_1['default'].normalizeAccents(keyword);
        if (!keywordNode) {
            var metadata = {suggestions: [{code: item.code, types: item.types, name: name}]};
            if (normalizedKeyword !== keyword) {
                trie.add(normalizedKeyword, metadata);
            }
            trie.add(keyword, metadata);
        } else {
            var suggestion = {code: item.code, types: item.types, name: name};
            var suggestions = shouldPrependKeyword
                ? __spreadArrays([suggestion], (_a = keywordNode.metaData.suggestions) !== null && _a !== void 0 ? _a : [])
                : __spreadArrays((_b = keywordNode.metaData.suggestions) !== null && _b !== void 0 ? _b : [], [suggestion]);
            var newMetadata = __assign(__assign({}, keywordNode.metaData), {suggestions: suggestions});
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
function getNameParts(name) {
    var nameSplit = name.split('_');
    return nameSplit.map(function (namePart, index) {
        return nameSplit.slice(index).join('_');
    });
}
function createTrie(lang) {
    if (lang === void 0) {
        lang = CONST_1['default'].LOCALES.DEFAULT;
    }
    var trie = new Trie_1['default']();
    var langEmojis = emojis_1.localeEmojis[lang];
    var defaultLangEmojis = emojis_1.localeEmojis[CONST_1['default'].LOCALES.DEFAULT];
    var isDefaultLocale = lang === CONST_1['default'].LOCALES.DEFAULT;
    emojis_1['default']
        .filter(function (item) {
            return !item.header;
        })
        .forEach(function (item) {
            var _a, _b, _c, _d, _e, _f;
            var englishName = item.name;
            var localeName =
                (_b = (_a = langEmojis === null || langEmojis === void 0 ? void 0 : langEmojis[item.code]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0
                    ? _b
                    : englishName;
            var normalizedName = StringUtils_1['default'].normalizeAccents(localeName);
            var node = trie.search(localeName);
            if (!node) {
                var metadata = {code: item.code, types: item.types, name: localeName, suggestions: []};
                if (normalizedName !== localeName) {
                    trie.add(normalizedName, metadata);
                }
                trie.add(localeName, metadata);
            } else {
                var newMetadata = {code: item.code, types: item.types, name: localeName, suggestions: node.metaData.suggestions};
                if (normalizedName !== localeName) {
                    trie.update(normalizedName, newMetadata);
                }
                trie.update(localeName, newMetadata);
            }
            var nameParts = getNameParts(localeName).slice(1); // We remove the first part because we already index the full name.
            addKeywordsToTrie(trie, nameParts, item, localeName);
            // Add keywords for both the locale language and English to enable users to search using either language.
            var keywords = (
                (_d = (_c = langEmojis === null || langEmojis === void 0 ? void 0 : langEmojis[item.code]) === null || _c === void 0 ? void 0 : _c.keywords) !== null && _d !== void 0
                    ? _d
                    : []
            ).concat(
                isDefaultLocale
                    ? []
                    : (_f = (_e = defaultLangEmojis === null || defaultLangEmojis === void 0 ? void 0 : defaultLangEmojis[item.code]) === null || _e === void 0 ? void 0 : _e.keywords) !==
                          null && _f !== void 0
                    ? _f
                    : [],
            );
            addKeywordsToTrie(trie, keywords, item, localeName);
            /**
             * If current language isn't the default, prepend the English name of the emoji in the suggestions as well.
             * We do this because when the user types the english name of the emoji, we want to show the emoji in the suggestions before all the others.
             */
            if (!isDefaultLocale) {
                var englishNameParts = getNameParts(englishName);
                addKeywordsToTrie(trie, englishNameParts, item, localeName, true);
            }
        });
    return trie;
}
var emojiTrie = supportedLanguages.reduce(function (acc, lang) {
    acc[lang] = undefined;
    return acc;
}, {});
var buildEmojisTrie = function (locale) {
    Timing_1['default'].start(CONST_1['default'].TIMING.TRIE_INITIALIZATION);
    // Normalize the locale to lowercase and take the first part before any dash
    var normalizedLocale = locale.toLowerCase().split('-').at(0);
    var localeToUse = supportedLanguages.includes(normalizedLocale) ? normalizedLocale : undefined;
    if (!localeToUse || emojiTrie[localeToUse]) {
        return; // Return early if the locale is not supported or the trie is already built
    }
    emojiTrie[localeToUse] = createTrie(localeToUse);
    Timing_1['default'].end(CONST_1['default'].TIMING.TRIE_INITIALIZATION);
};
exports.buildEmojisTrie = buildEmojisTrie;
exports['default'] = emojiTrie;
