"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils = require("@libs/EmojiUtils");
function TextWithTooltip(_a) {
    var text = _a.text, style = _a.style, _b = _a.numberOfLines, numberOfLines = _b === void 0 ? 1 : _b;
    var styles = (0, useThemeStyles_1.default)();
    var processedTextArray = EmojiUtils.splitTextWithEmojis(text);
    return (<Text_1.default style={style} numberOfLines={numberOfLines}>
            {processedTextArray.length !== 0 ? EmojiUtils.getProcessedText(processedTextArray, [style, styles.emojisFontFamily]) : text}
        </Text_1.default>);
}
TextWithTooltip.displayName = 'TextWithTooltip';
exports.default = TextWithTooltip;
