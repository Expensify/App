"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Emojis = require("@assets/emojis");
/**
 * Fetch the emoji code of selected skinTone
 */
function getSkinToneEmojiFromIndex(skinToneIndex) {
    var _a;
    return (_a = Emojis.skinTones.find(function (emoji) { return emoji.skinTone === skinToneIndex; })) !== null && _a !== void 0 ? _a : Emojis.skinTones[0];
}
exports.default = getSkinToneEmojiFromIndex;
