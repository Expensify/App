"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
function ReactionTooltipContent(_a) {
    var accountIDs = _a.accountIDs, currentUserPersonalDetails = _a.currentUserPersonalDetails, emojiCodes = _a.emojiCodes, emojiName = _a.emojiName;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var users = (0, react_1.useMemo)(function () { return PersonalDetailsUtils.getPersonalDetailsByIDs({ accountIDs: accountIDs, currentUserAccountID: currentUserPersonalDetails.accountID, shouldChangeUserDisplayName: true }); }, [currentUserPersonalDetails.accountID, accountIDs]);
    var namesString = users
        .map(function (user) { return user === null || user === void 0 ? void 0 : user.displayName; })
        .filter(function (name) { return name; })
        .join(', ');
    return (<react_native_1.View style={[styles.alignItemsCenter, styles.ph2]}>
            <react_native_1.View style={styles.flexRow}>
                {emojiCodes.map(function (emojiCode) { return (<Text_1.default key={emojiCode} style={styles.reactionEmojiTitle}>
                        {emojiCode}
                    </Text_1.default>); })}
            </react_native_1.View>

            <Text_1.default style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{namesString}</Text_1.default>

            <Text_1.default style={[styles.textMicro, styles.fontColorReactionLabel]}>{"".concat(translate('emojiReactions.reactedWith'), " :").concat(emojiName, ":")}</Text_1.default>
        </react_native_1.View>);
}
ReactionTooltipContent.displayName = 'ReactionTooltipContent';
exports.default = react_1.default.memo(ReactionTooltipContent);
