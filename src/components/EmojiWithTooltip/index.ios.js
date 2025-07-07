"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function EmojiWithTooltip(_a) {
    var emojiCode = _a.emojiCode, _b = _a.style, style = _b === void 0 ? {} : _b, _c = _a.isMedium, isMedium = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    return isMedium ? (<Text_1.default style={style}>
            <react_native_1.View>
                <Text_1.default style={styles.emojisWithTextFontSizeAligned}>{emojiCode}</Text_1.default>
            </react_native_1.View>
        </Text_1.default>) : (<Text_1.default style={style}>{emojiCode}</Text_1.default>);
}
EmojiWithTooltip.displayName = 'EmojiWithTooltip';
exports.default = EmojiWithTooltip;
