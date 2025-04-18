"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.categoryFrequentlyUsed = exports.skinTones = exports.importEmojiLocale = exports.localeEmojis = exports.emojiCodeTableWithSkinTones = exports.emojiNameTable = void 0;
var common_1 = require("./common");
var emojiNameTable = common_1["default"].reduce(function (prev, cur) {
    var newValue = prev;
    if (!('header' in cur) && cur.name) {
        newValue[cur.name] = cur;
    }
    return newValue;
}, {});
exports.emojiNameTable = emojiNameTable;
var emojiCodeTableWithSkinTones = common_1["default"].reduce(function (prev, cur) {
    var newValue = prev;
    if (!('header' in cur)) {
        newValue[cur.code] = cur;
    }
    if ('types' in cur && cur.types) {
        cur.types.forEach(function (type) {
            newValue[type] = cur;
        });
    }
    return newValue;
}, {});
exports.emojiCodeTableWithSkinTones = emojiCodeTableWithSkinTones;
var localeEmojis = {
    en: undefined,
    es: undefined
};
exports.localeEmojis = localeEmojis;
var importEmojiLocale = function (locale) {
    var normalizedLocale = locale.toLowerCase().split('-').at(0);
    if (!localeEmojis[normalizedLocale]) {
        var emojiImportPromise = normalizedLocale === 'en' ? Promise.resolve().then(function () { return require('./en'); }) : Promise.resolve().then(function () { return require('./es'); });
        return emojiImportPromise.then(function (esEmojiModule) {
            // it is needed because in jest test the modules are imported in double nested default object
            localeEmojis[normalizedLocale] = esEmojiModule["default"]["default"] ? esEmojiModule["default"]["default"] : esEmojiModule["default"];
        });
    }
    return Promise.resolve();
};
exports.importEmojiLocale = importEmojiLocale;
exports["default"] = common_1["default"];
var common_2 = require("./common");
__createBinding(exports, common_2, "skinTones");
__createBinding(exports, common_2, "categoryFrequentlyUsed");
