"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
function EmojiWithTooltip(_a) {
    var emojiCode = _a.emojiCode, _b = _a.style, style = _b === void 0 ? {} : _b;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var styles = (0, useThemeStyles_1.default)();
    var emoji = (0, EmojiUtils_1.findEmojiByCode)(emojiCode);
    var emojiName = (0, EmojiUtils_1.getLocalizedEmojiName)(emoji === null || emoji === void 0 ? void 0 : emoji.name, preferredLocale);
    var emojiTooltipContent = (0, react_1.useCallback)(function () { return (<react_native_1.View style={[styles.alignItemsCenter, styles.ph2]}>
                <react_native_1.View style={[styles.flexRow, styles.emojiTooltipWrapper]}>
                    <Text_1.default key={emojiCode} style={styles.onlyEmojisText}>
                        {emojiCode}
                    </Text_1.default>
                </react_native_1.View>
                <Text_1.default style={[styles.textMicro, styles.fontColorReactionLabel]}>{":".concat(emojiName, ":")}</Text_1.default>
            </react_native_1.View>); }, [emojiCode, emojiName, styles.alignItemsCenter, styles.ph2, styles.flexRow, styles.emojiTooltipWrapper, styles.fontColorReactionLabel, styles.onlyEmojisText, styles.textMicro]);
    return (<Tooltip_1.default renderTooltipContent={emojiTooltipContent}>
            <Text_1.default style={[style, styles.cursorDefault]}>{emojiCode}</Text_1.default>
        </Tooltip_1.default>);
}
EmojiWithTooltip.displayName = 'EmojiWithTooltip';
exports.default = EmojiWithTooltip;
