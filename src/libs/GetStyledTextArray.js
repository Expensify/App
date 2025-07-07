"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var StringUtils_1 = require("./StringUtils");
var getStyledTextArray = function (name, prefix) {
    var texts = [];
    var prefixLowercase = prefix.toLowerCase();
    var prefixLocation = StringUtils_1.default.normalizeAccents(name)
        .toLowerCase()
        .search(expensify_common_1.Str.escapeForRegExp(StringUtils_1.default.normalizeAccents(prefixLowercase)));
    if (prefixLocation === 0 && prefix.length === name.length) {
        texts.push({ text: name, isColored: true });
    }
    else if (prefixLocation === 0 && prefix.length !== name.length) {
        texts.push({ text: name.slice(0, prefix.length), isColored: true }, { text: name.slice(prefix.length), isColored: false });
    }
    else if (prefixLocation > 0 && prefix.length !== name.length) {
        texts.push({ text: name.slice(0, prefixLocation), isColored: false }, {
            text: name.slice(prefixLocation, prefixLocation + prefix.length),
            isColored: true,
        }, {
            text: name.slice(prefixLocation + prefix.length),
            isColored: false,
        });
    }
    else {
        texts.push({ text: name, isColored: false });
    }
    return texts;
};
exports.default = getStyledTextArray;
