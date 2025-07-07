"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var Browser = require("@libs/Browser");
var EmojiUtils = require("@libs/EmojiUtils");
function ZeroWidthView(_a) {
    var _b = _a.text, text = _b === void 0 ? '' : _b, _c = _a.displayAsGroup, displayAsGroup = _c === void 0 ? false : _c;
    var firstLetterIsEmoji = EmojiUtils.isFirstLetterEmoji(text);
    if (firstLetterIsEmoji && !displayAsGroup && !Browser.isMobile()) {
        return <Text_1.default>&#x200b;</Text_1.default>;
    }
    return null;
}
ZeroWidthView.displayName = 'ZeroWidthView';
exports.default = ZeroWidthView;
