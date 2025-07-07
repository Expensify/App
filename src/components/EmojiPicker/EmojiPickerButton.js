"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ActionSheetAwareScrollView = require("@components/ActionSheetAwareScrollView");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var CONST_1 = require("@src/CONST");
function EmojiPickerButton(_a) {
    var _b = _a.isDisabled, isDisabled = _b === void 0 ? false : _b, _c = _a.emojiPickerID, emojiPickerID = _c === void 0 ? '' : _c, _d = _a.shiftVertical, shiftVertical = _d === void 0 ? 0 : _d, onPress = _a.onPress, onModalHide = _a.onModalHide, onEmojiSelected = _a.onEmojiSelected;
    var actionSheetContext = (0, react_1.useContext)(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var emojiPopoverAnchor = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var isFocused = (0, native_1.useIsFocused)();
    var openEmojiPicker = function (e) {
        var _a;
        if (!isFocused) {
            return;
        }
        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.CLOSE_KEYBOARD,
        });
        if (!((_a = EmojiPickerAction_1.emojiPickerRef === null || EmojiPickerAction_1.emojiPickerRef === void 0 ? void 0 : EmojiPickerAction_1.emojiPickerRef.current) === null || _a === void 0 ? void 0 : _a.isEmojiPickerVisible)) {
            (0, EmojiPickerAction_1.showEmojiPicker)(onModalHide, onEmojiSelected, emojiPopoverAnchor, {
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                shiftVertical: shiftVertical,
            }, function () { }, emojiPickerID);
        }
        else {
            EmojiPickerAction_1.emojiPickerRef.current.hideEmojiPicker();
        }
        onPress === null || onPress === void 0 ? void 0 : onPress(e);
    };
    (0, react_1.useEffect)(function () { return EmojiPickerAction_1.resetEmojiPopoverAnchor; }, []);
    return (<PopoverAnchorTooltip_1.default text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback_1.default ref={emojiPopoverAnchor} style={function (_a) {
        var hovered = _a.hovered, pressed = _a.pressed;
        return [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(hovered, pressed))];
    }} disabled={isDisabled} onPress={openEmojiPicker} id={CONST_1.default.EMOJI_PICKER_BUTTON_NATIVE_ID} accessibilityLabel={translate('reportActionCompose.emoji')}>
                {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<Icon_1.default src={Expensicons.Emoji} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed))}/>);
        }}
            </PressableWithoutFeedback_1.default>
        </PopoverAnchorTooltip_1.default>);
}
EmojiPickerButton.displayName = 'EmojiPickerButton';
exports.default = (0, react_1.memo)(EmojiPickerButton);
