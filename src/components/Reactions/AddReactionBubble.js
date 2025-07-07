"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var variables_1 = require("@styles/variables");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
function AddReactionBubble(_a) {
    var _b;
    var onSelectEmoji = _a.onSelectEmoji, reportAction = _a.reportAction, onPressOpenPicker = _a.onPressOpenPicker, _c = _a.onWillShowPicker, onWillShowPicker = _c === void 0 ? function () { } : _c, _d = _a.isContextMenu, isContextMenu = _d === void 0 ? false : _d, setIsEmojiPickerActive = _a.setIsEmojiPickerActive;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var ref = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    (0, react_1.useEffect)(function () { return EmojiPickerAction_1.resetEmojiPopoverAnchor; }, []);
    var onPress = function () {
        var _a;
        var openPicker = function (refParam, anchorOrigin) {
            (0, EmojiPickerAction_1.showEmojiPicker)(function () {
                setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(false);
            }, function (emojiCode, emojiObject) {
                onSelectEmoji(emojiObject);
            }, refParam !== null && refParam !== void 0 ? refParam : ref, anchorOrigin, onWillShowPicker, reportAction.reportActionID);
        };
        if (!((_a = EmojiPickerAction_1.emojiPickerRef.current) === null || _a === void 0 ? void 0 : _a.isEmojiPickerVisible)) {
            setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(true);
            if (onPressOpenPicker) {
                onPressOpenPicker(openPicker);
            }
            else {
                openPicker();
            }
        }
        else {
            setIsEmojiPickerActive === null || setIsEmojiPickerActive === void 0 ? void 0 : setIsEmojiPickerActive(false);
            EmojiPickerAction_1.emojiPickerRef.current.hideEmojiPicker();
        }
    };
    return (<PopoverAnchorTooltip_1.default text={translate('emojiReactions.addReactionTooltip')}>
            <PressableWithFeedback_1.default ref={ref} style={function (_a) {
        var hovered = _a.hovered, pressed = _a.pressed;
        return [styles.emojiReactionBubble, styles.userSelectNone, StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, false, isContextMenu)];
    }} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(onPress)} onMouseDown={function (event) {
            // Allow text input blur when Add reaction is right clicked
            if (!event || event.button === 2) {
                return;
            }
            // Prevent text input blur when Add reaction is left clicked
            event.preventDefault();
        }} accessibilityLabel={translate('emojiReactions.addReactionTooltip')} role={CONST_1.default.ROLE.BUTTON} 
    // disable dimming
    pressDimmingValue={1} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<>
                        {/* This (invisible) text will make the view have the same size as a regular
       emoji reaction. We make the text invisible and put the
       icon on top of it. */}
                        <Text_1.default style={[styles.opacity0, StyleUtils.getEmojiReactionBubbleTextStyle(isContextMenu)]}>{'\u2800\u2800'}</Text_1.default>
                        <react_native_1.View style={styles.pAbsolute}>
                            <Icon_1.default src={Expensicons.AddReaction} width={isContextMenu ? variables_1.default.iconSizeNormal : variables_1.default.iconSizeSmall} height={isContextMenu ? variables_1.default.iconSizeNormal : variables_1.default.iconSizeSmall} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed))}/>
                        </react_native_1.View>
                    </>);
        }}
            </PressableWithFeedback_1.default>
        </PopoverAnchorTooltip_1.default>);
}
AddReactionBubble.displayName = 'AddReactionBubble';
exports.default = AddReactionBubble;
