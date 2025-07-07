"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils = require("@libs/EmojiUtils");
var GetStyledTextArray_1 = require("@libs/GetStyledTextArray");
var AutoCompleteSuggestions_1 = require("./AutoCompleteSuggestions");
var Text_1 = require("./Text");
/**
 * Create unique keys for each emoji item
 */
var keyExtractor = function (item, index) { return "".concat(item.name, "+").concat(index, "}"); };
function EmojiSuggestions(_a) {
    var emojis = _a.emojis, onSelect = _a.onSelect, prefix = _a.prefix, isEmojiPickerLarge = _a.isEmojiPickerLarge, preferredSkinToneIndex = _a.preferredSkinToneIndex, _b = _a.highlightedEmojiIndex, highlightedEmojiIndex = _b === void 0 ? 0 : _b, _c = _a.measureParentContainerAndReportCursor, measureParentContainerAndReportCursor = _c === void 0 ? function () { } : _c, resetSuggestions = _a.resetSuggestions;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    /**
     * Render an emoji suggestion menu item component.
     */
    var renderSuggestionMenuItem = (0, react_1.useCallback)(function (item) {
        var styledTextArray = (0, GetStyledTextArray_1.default)(item.name, prefix);
        return (<react_native_1.View style={styles.autoCompleteSuggestionContainer}>
                    <Text_1.default style={styles.emojiSuggestionsEmoji}>{EmojiUtils.getEmojiCodeWithSkinColor(item, preferredSkinToneIndex)}</Text_1.default>
                    <Text_1.default numberOfLines={2} style={styles.emojiSuggestionsText}>
                        :
                        {styledTextArray.map(function (_a) {
                var text = _a.text, isColored = _a.isColored;
                return (<Text_1.default key={"".concat(text, "+").concat(isColored)} style={StyleUtils.getColoredBackgroundStyle(isColored)}>
                                {text}
                            </Text_1.default>);
            })}
                        :
                    </Text_1.default>
                </react_native_1.View>);
    }, [prefix, styles.autoCompleteSuggestionContainer, styles.emojiSuggestionsEmoji, styles.emojiSuggestionsText, preferredSkinToneIndex, StyleUtils]);
    return (<AutoCompleteSuggestions_1.default suggestions={emojis} renderSuggestionMenuItem={renderSuggestionMenuItem} keyExtractor={keyExtractor} highlightedSuggestionIndex={highlightedEmojiIndex} onSelect={onSelect} isSuggestionPickerLarge={isEmojiPickerLarge} accessibilityLabelExtractor={keyExtractor} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} resetSuggestions={resetSuggestions}/>);
}
EmojiSuggestions.displayName = 'EmojiSuggestions';
exports.default = EmojiSuggestions;
