"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseMiniContextMenuItem_1 = require("@components/BaseMiniContextMenuItem");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var getButtonState_1 = require("@libs/getButtonState");
var variables_1 = require("@styles/variables");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Shows the four common quick reactions and a
 * emoji picker icon button. This is used for the mini
 * context menu which we just show on web, when hovering
 * a message.
 */
function MiniQuickEmojiReactions(_a) {
    var reportAction = _a.reportAction, reportActionID = _a.reportActionID, onEmojiSelected = _a.onEmojiSelected, _b = _a.onPressOpenPicker, onPressOpenPicker = _b === void 0 ? function () { } : _b, _c = _a.onEmojiPickerClosed, onEmojiPickerClosed = _c === void 0 ? function () { } : _c;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var ref = (0, react_1.useRef)(null);
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, preferredLocale = _d.preferredLocale;
    var preferredSkinTone = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE, { canBeMissing: true, initialValue: CONST_1.default.EMOJI_DEFAULT_SKIN_TONE })[0];
    var emojiReactions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID), { canBeMissing: true, initialValue: {} })[0];
    var openEmojiPicker = function () {
        onPressOpenPicker();
        (0, EmojiPickerAction_1.showEmojiPicker)(onEmojiPickerClosed, function (emojiCode, emojiObject) {
            onEmojiSelected(emojiObject, emojiReactions);
        }, ref, undefined, function () { }, reportAction.reportActionID);
    };
    return (<react_native_1.View style={styles.flexRow}>
            {CONST_1.default.QUICK_REACTIONS.slice(0, 3).map(function (emoji) {
            var _a;
            return (<BaseMiniContextMenuItem_1.default key={emoji.name} isDelayButtonStateComplete={false} tooltipText={":".concat((0, EmojiUtils_1.getLocalizedEmojiName)(emoji.name, preferredLocale), ":")} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () { return onEmojiSelected(emoji, emojiReactions); })}>
                    <Text_1.default style={[styles.miniQuickEmojiReactionText, styles.userSelectNone]} dataSet={_a = {}, _a[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _a}>
                        {(0, EmojiUtils_1.getPreferredEmojiCode)(emoji, preferredSkinTone)}
                    </Text_1.default>
                </BaseMiniContextMenuItem_1.default>);
        })}
            <BaseMiniContextMenuItem_1.default ref={ref} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
            var _a, _b;
            if (!((_a = EmojiPickerAction_1.emojiPickerRef.current) === null || _a === void 0 ? void 0 : _a.isEmojiPickerVisible)) {
                openEmojiPicker();
            }
            else {
                (_b = EmojiPickerAction_1.emojiPickerRef.current) === null || _b === void 0 ? void 0 : _b.hideEmojiPicker();
            }
        })} isDelayButtonStateComplete={false} tooltipText={translate('emojiReactions.addReactionTooltip')}>
                {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<Icon_1.default width={variables_1.default.iconSizeMedium} height={variables_1.default.iconSizeMedium} src={Expensicons.AddReaction} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed, false))}/>);
        }}
            </BaseMiniContextMenuItem_1.default>
        </react_native_1.View>);
}
MiniQuickEmojiReactions.displayName = 'MiniQuickEmojiReactions';
exports.default = MiniQuickEmojiReactions;
