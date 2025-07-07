"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Emojis = require("@assets/emojis");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePreferredEmojiSkinTone_1 = require("@hooks/usePreferredEmojiSkinTone");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var EmojiPickerMenuItem_1 = require("./EmojiPickerMenuItem");
var getSkinToneEmojiFromIndex_1 = require("./getSkinToneEmojiFromIndex");
function EmojiSkinToneList() {
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, react_1.useState)(null), highlightedIndex = _a[0], setHighlightedIndex = _a[1];
    var _b = (0, react_1.useState)(false), isSkinToneListVisible = _b[0], setIsSkinToneListVisible = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, usePreferredEmojiSkinTone_1.default)(), preferredSkinTone = _c[0], setPreferredSkinTone = _c[1];
    var toggleIsSkinToneListVisible = (0, react_1.useCallback)(function () {
        setIsSkinToneListVisible(function (prev) { return !prev; });
    }, []);
    /**
     * Set the preferred skin tone in Onyx and close the skin tone picker
     */
    function updateSelectedSkinTone(skinToneEmoji) {
        setHighlightedIndex(skinToneEmoji.skinTone);
        setPreferredSkinTone(skinToneEmoji.skinTone);
    }
    (0, react_1.useEffect)(function () {
        if (!isSkinToneListVisible) {
            return;
        }
        toggleIsSkinToneListVisible();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- only run when preferredSkinTone updates
    }, [preferredSkinTone]);
    var currentSkinTone = (0, getSkinToneEmojiFromIndex_1.default)(preferredSkinTone);
    (0, react_1.useEffect)(function () {
        setHighlightedIndex(currentSkinTone.skinTone);
    }, [currentSkinTone.skinTone]);
    return (<react_native_1.View style={[styles.flexRow, styles.p3, styles.ph4, styles.emojiPickerContainer]}>
            {!isSkinToneListVisible && (<PressableWithoutFeedback_1.default onPress={toggleIsSkinToneListVisible} style={[styles.flexRow, styles.alignSelfCenter, styles.justifyContentStart, styles.alignItemsCenter]} accessibilityLabel={translate('emojiPicker.skinTonePickerLabel')} role={CONST_1.default.ROLE.BUTTON}>
                    <react_native_1.View style={[styles.emojiItem, styles.wAuto, styles.justifyContentCenter]}>
                        <Text_1.default style={[styles.emojiText, styles.ph2, styles.textNoWrap]}>{currentSkinTone.code}</Text_1.default>
                    </react_native_1.View>
                    <Text_1.default style={[styles.emojiSkinToneTitle]}>{translate('emojiPicker.skinTonePickerLabel')}</Text_1.default>
                </PressableWithoutFeedback_1.default>)}
            {isSkinToneListVisible && (<react_native_1.View style={[styles.flexRow, styles.flex1]}>
                    {Emojis.skinTones.map(function (skinToneEmoji) { return (<EmojiPickerMenuItem_1.default onPress={function () { return updateSelectedSkinTone(skinToneEmoji); }} onHoverIn={function () { return setHighlightedIndex(skinToneEmoji.skinTone); }} onHoverOut={function () { return setHighlightedIndex(null); }} key={skinToneEmoji.code} emoji={skinToneEmoji.code} isHighlighted={skinToneEmoji.skinTone === highlightedIndex || skinToneEmoji.skinTone === currentSkinTone.skinTone}/>); })}
                </react_native_1.View>)}
        </react_native_1.View>);
}
EmojiSkinToneList.displayName = 'EmojiSkinToneList';
exports.default = EmojiSkinToneList;
