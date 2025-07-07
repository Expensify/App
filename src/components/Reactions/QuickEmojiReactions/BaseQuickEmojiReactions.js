"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddReactionBubble_1 = require("@components/Reactions/AddReactionBubble");
var EmojiReactionBubble_1 = require("@components/Reactions/EmojiReactionBubble");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BaseQuickEmojiReactions(_a) {
    var reportAction = _a.reportAction, reportActionID = _a.reportActionID, onEmojiSelected = _a.onEmojiSelected, _b = _a.onPressOpenPicker, onPressOpenPicker = _b === void 0 ? function () { } : _b, _c = _a.onWillShowPicker, onWillShowPicker = _c === void 0 ? function () { } : _c, setIsEmojiPickerActive = _a.setIsEmojiPickerActive;
    var styles = (0, useThemeStyles_1.default)();
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var preferredSkinTone = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE, { canBeMissing: true, initialValue: CONST_1.default.EMOJI_DEFAULT_SKIN_TONE })[0];
    var emojiReactions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reportActionID), { canBeMissing: true, initialValue: {} })[0];
    return (<react_native_1.View style={styles.quickReactionsContainer}>
            {CONST_1.default.QUICK_REACTIONS.map(function (emoji) { return (<Tooltip_1.default text={":".concat((0, EmojiUtils_1.getLocalizedEmojiName)(emoji.name, preferredLocale), ":")} key={emoji.name}>
                    <react_native_1.View>
                        <EmojiReactionBubble_1.default emojiCodes={[(0, EmojiUtils_1.getPreferredEmojiCode)(emoji, preferredSkinTone)]} isContextMenu onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () { return onEmojiSelected(emoji, emojiReactions); })}/>
                    </react_native_1.View>
                </Tooltip_1.default>); })}
            <AddReactionBubble_1.default isContextMenu onPressOpenPicker={onPressOpenPicker} onWillShowPicker={onWillShowPicker} onSelectEmoji={function (emoji) { return onEmojiSelected(emoji, emojiReactions); }} reportAction={reportAction} setIsEmojiPickerActive={setIsEmojiPickerActive}/>
        </react_native_1.View>);
}
BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
exports.default = BaseQuickEmojiReactions;
