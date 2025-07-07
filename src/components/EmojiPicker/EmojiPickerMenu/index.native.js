"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmojiPickerMenuItem_1 = require("@components/EmojiPicker/EmojiPickerMenuItem");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var CONST_1 = require("@src/CONST");
var BaseEmojiPickerMenu_1 = require("./BaseEmojiPickerMenu");
var useEmojiPickerMenu_1 = require("./useEmojiPickerMenu");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EmojiPickerMenu(_a, ref) {
    var onEmojiSelected = _a.onEmojiSelected, activeEmoji = _a.activeEmoji;
    var styles = (0, useThemeStyles_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var singleExecution = (0, useSingleExecution_1.default)().singleExecution;
    var _b = (0, useEmojiPickerMenu_1.default)(), allEmojis = _b.allEmojis, headerEmojis = _b.headerEmojis, headerRowIndices = _b.headerRowIndices, filteredEmojis = _b.filteredEmojis, headerIndices = _b.headerIndices, setFilteredEmojis = _b.setFilteredEmojis, setHeaderIndices = _b.setHeaderIndices, isListFiltered = _b.isListFiltered, suggestEmojis = _b.suggestEmojis, preferredSkinTone = _b.preferredSkinTone, listStyle = _b.listStyle, emojiListRef = _b.emojiListRef;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var updateEmojiList = function (emojiData, headerData) {
        if (headerData === void 0) { headerData = []; }
        setFilteredEmojis(emojiData);
        setHeaderIndices(headerData);
        react_native_1.InteractionManager.runAfterInteractions(function () {
            requestAnimationFrame(function () {
                var _a;
                (_a = emojiListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: 0, animated: false });
            });
        });
    };
    /**
     * Filter the entire list of emojis to only emojis that have the search term in their keywords
     */
    var filterEmojis = (0, debounce_1.default)(function (searchTerm) {
        var _a = suggestEmojis(searchTerm), normalizedSearchTerm = _a[0], newFilteredEmojiList = _a[1];
        if (normalizedSearchTerm === '') {
            updateEmojiList(allEmojis, headerRowIndices);
        }
        else {
            updateEmojiList(newFilteredEmojiList !== null && newFilteredEmojiList !== void 0 ? newFilteredEmojiList : [], []);
        }
    }, 300);
    var scrollToHeader = (0, react_1.useCallback)(function (headerIndex) {
        var _a;
        var calculatedOffset = Math.floor(headerIndex / CONST_1.default.EMOJI_NUM_PER_ROW) * CONST_1.default.EMOJI_PICKER_HEADER_HEIGHT;
        (_a = emojiListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: calculatedOffset, animated: true });
    }, [emojiListRef]);
    /**
     * Given an emoji item object, render a component based on its type.
     * Items with the code "SPACER" return nothing and are used to fill rows up to 8
     * so that the sticky headers function properly.
     */
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, target = _a.target;
        var code = item.code;
        var types = 'types' in item ? item.types : undefined;
        if ('spacer' in item && item.spacer) {
            return null;
        }
        if ('header' in item && item.header) {
            return (<react_native_1.View style={[styles.emojiHeaderContainer, target === 'StickyHeader' ? styles.mh4 : { width: windowWidth }]}>
                        <Text_1.default style={styles.textLabelSupporting}>{translate("emojiPicker.headers.".concat(code))}</Text_1.default>
                    </react_native_1.View>);
        }
        var emojiCode = typeof preferredSkinTone === 'number' && preferredSkinTone !== -1 && (types === null || types === void 0 ? void 0 : types.at(preferredSkinTone)) ? types.at(preferredSkinTone) : code;
        var shouldEmojiBeHighlighted = !!activeEmoji && (0, EmojiUtils_1.getRemovedSkinToneEmoji)(emojiCode) === (0, EmojiUtils_1.getRemovedSkinToneEmoji)(activeEmoji);
        return (<EmojiPickerMenuItem_1.default onPress={singleExecution(function (emoji) {
                if (!('name' in item)) {
                    return;
                }
                onEmojiSelected(emoji, item);
            })} emoji={emojiCode !== null && emojiCode !== void 0 ? emojiCode : ''} isHighlighted={shouldEmojiBeHighlighted}/>);
    }, [styles, windowWidth, preferredSkinTone, singleExecution, onEmojiSelected, translate, activeEmoji]);
    return (<react_native_1.View style={[styles.emojiPickerContainer, StyleUtils.getEmojiPickerStyle(shouldUseNarrowLayout)]}>
            <react_native_1.View style={[styles.ph4, styles.pb1, styles.pt2]}>
                <TextInput_1.default label={translate('common.search')} accessibilityLabel={translate('common.search')} role={CONST_1.default.ROLE.PRESENTATION} onChangeText={filterEmojis} blurOnSubmit={filteredEmojis.length > 0}/>
            </react_native_1.View>
            <BaseEmojiPickerMenu_1.default isFiltered={isListFiltered} headerEmojis={headerEmojis} scrollToHeader={scrollToHeader} listWrapperStyle={[
            listStyle,
            {
                width: Math.floor(windowWidth),
            },
        ]} ref={emojiListRef} data={filteredEmojis} renderItem={renderItem} extraData={[filteredEmojis, preferredSkinTone]} stickyHeaderIndices={headerIndices} alwaysBounceVertical={filteredEmojis.length !== 0}/>
        </react_native_1.View>);
}
EmojiPickerMenu.displayName = 'EmojiPickerMenu';
exports.default = react_1.default.forwardRef(EmojiPickerMenu);
