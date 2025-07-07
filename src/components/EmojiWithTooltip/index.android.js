"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Text_1 = require("@components/Text");
function EmojiWithTooltip(_a) {
    var emojiCode = _a.emojiCode, _b = _a.style, style = _b === void 0 ? {} : _b;
    return <Text_1.default style={style}>{emojiCode}</Text_1.default>;
}
EmojiWithTooltip.displayName = 'EmojiWithTooltip';
exports.default = EmojiWithTooltip;
