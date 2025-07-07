"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RNMarkdownTextInput_1 = require("@components/RNMarkdownTextInput");
var RNMaskedTextInput_1 = require("@components/RNMaskedTextInput");
var RNTextInput_1 = require("@components/RNTextInput");
var InputComponentMap = new Map([
    ['default', RNTextInput_1.default],
    ['mask', RNMaskedTextInput_1.default],
    ['markdown', RNMarkdownTextInput_1.default],
]);
exports.default = InputComponentMap;
