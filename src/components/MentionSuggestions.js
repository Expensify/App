"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var GetStyledTextArray_1 = require("@libs/GetStyledTextArray");
var CONST_1 = require("@src/CONST");
var AutoCompleteSuggestions_1 = require("./AutoCompleteSuggestions");
var Avatar_1 = require("./Avatar");
var Text_1 = require("./Text");
/**
 * Create unique keys for each mention item
 */
var keyExtractor = function (item) { return item.alternateText; };
function MentionSuggestions(_a) {
    var prefix = _a.prefix, mentions = _a.mentions, _b = _a.highlightedMentionIndex, highlightedMentionIndex = _b === void 0 ? 0 : _b, onSelect = _a.onSelect, isMentionPickerLarge = _a.isMentionPickerLarge, _c = _a.measureParentContainerAndReportCursor, measureParentContainerAndReportCursor = _c === void 0 ? function () { } : _c, resetSuggestions = _a.resetSuggestions;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    /**
     * Render a suggestion menu item component.
     */
    var renderSuggestionMenuItem = (0, react_1.useCallback)(function (item) {
        var _a, _b, _c, _d, _e, _f;
        var isIcon = item.text === CONST_1.default.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;
        var styledDisplayName = (0, GetStyledTextArray_1.default)(item.text, prefix);
        var styledHandle = item.text === item.alternateText ? undefined : (0, GetStyledTextArray_1.default)(item.alternateText, prefix);
        return (<react_native_1.View style={[styles.autoCompleteSuggestionContainer, styles.ph2]}>
                    {!!item.icons && !!item.icons.length && (<react_native_1.View style={styles.mentionSuggestionsAvatarContainer}>
                            <Avatar_1.default source={(_a = item.icons.at(0)) === null || _a === void 0 ? void 0 : _a.source} size={isIcon ? CONST_1.default.AVATAR_SIZE.MENTION_ICON : CONST_1.default.AVATAR_SIZE.SMALLER} name={(_b = item.icons.at(0)) === null || _b === void 0 ? void 0 : _b.name} avatarID={(_c = item.icons.at(0)) === null || _c === void 0 ? void 0 : _c.id} type={(_e = (_d = item.icons.at(0)) === null || _d === void 0 ? void 0 : _d.type) !== null && _e !== void 0 ? _e : CONST_1.default.ICON_TYPE_AVATAR} fill={isIcon ? theme.success : undefined} fallbackIcon={(_f = item.icons.at(0)) === null || _f === void 0 ? void 0 : _f.fallbackIcon}/>
                        </react_native_1.View>)}
                    <Text_1.default style={[styles.mentionSuggestionsText, styles.flexShrink1]} numberOfLines={1}>
                        {styledDisplayName === null || styledDisplayName === void 0 ? void 0 : styledDisplayName.map(function (_a, i) {
                var text = _a.text, isColored = _a.isColored;
                return (<Text_1.default 
                // eslint-disable-next-line react/no-array-index-key
                key={"".concat(text).concat(i)} style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.mentionSuggestionsDisplayName]}>
                                {text}
                            </Text_1.default>);
            })}
                    </Text_1.default>
                    <Text_1.default style={[styles.mentionSuggestionsText, styles.flex1]} numberOfLines={1}>
                        {styledHandle === null || styledHandle === void 0 ? void 0 : styledHandle.map(function (_a, i) {
                var text = _a.text, isColored = _a.isColored;
                return !!text && (<Text_1.default 
                // eslint-disable-next-line react/no-array-index-key
                key={"".concat(text).concat(i)} style={[StyleUtils.getColoredBackgroundStyle(isColored), styles.textSupporting]}>
                                        {text}
                                    </Text_1.default>);
            })}
                    </Text_1.default>
                </react_native_1.View>);
    }, [
        prefix,
        styles.autoCompleteSuggestionContainer,
        styles.ph2,
        styles.mentionSuggestionsAvatarContainer,
        styles.mentionSuggestionsText,
        styles.flexShrink1,
        styles.flex1,
        styles.mentionSuggestionsDisplayName,
        styles.textSupporting,
        theme.success,
        StyleUtils,
    ]);
    return (<AutoCompleteSuggestions_1.default suggestions={mentions} renderSuggestionMenuItem={renderSuggestionMenuItem} keyExtractor={keyExtractor} highlightedSuggestionIndex={highlightedMentionIndex} onSelect={onSelect} isSuggestionPickerLarge={isMentionPickerLarge} accessibilityLabelExtractor={keyExtractor} measureParentContainerAndReportCursor={measureParentContainerAndReportCursor} resetSuggestions={resetSuggestions}/>);
}
MentionSuggestions.displayName = 'MentionSuggestions';
exports.default = MentionSuggestions;
