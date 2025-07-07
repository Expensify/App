"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var convertToLTR_1 = require("@libs/convertToLTR");
var EmojiUtils = require("@libs/EmojiUtils");
function TextWithEmojiFragment(_a) {
    var _b = _a.message, message = _b === void 0 ? '' : _b, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var processedTextArray = (0, react_1.useMemo)(function () { return EmojiUtils.splitTextWithEmojis(message); }, [message]);
    return (<Text_1.default style={style}>
            {processedTextArray.map(function (_a, index) {
            var text = _a.text, isEmoji = _a.isEmoji;
            return isEmoji ? (<Text_1.default 
            // eslint-disable-next-line react/no-array-index-key
            key={index} style={styles.emojisWithTextFontSize}>
                        {text}
                    </Text_1.default>) : ((0, convertToLTR_1.default)(text));
        })}
        </Text_1.default>);
}
TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';
exports.default = TextWithEmojiFragment;
