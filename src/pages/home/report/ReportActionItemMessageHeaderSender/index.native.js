"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
function ReportActionItemMessageHeaderSender(_a) {
    var fragmentText = _a.fragmentText, accountID = _a.accountID, delegateAccountID = _a.delegateAccountID, actorIcon = _a.actorIcon, isSingleLine = _a.isSingleLine;
    var styles = (0, useThemeStyles_1.default)();
    var processedTextArray = (0, react_1.useMemo)(function () { return (0, EmojiUtils_1.splitTextWithEmojis)(fragmentText); }, [fragmentText]);
    return (<UserDetailsTooltip_1.default accountID={accountID} delegateAccountID={delegateAccountID} icon={actorIcon}>
            <Text_1.default numberOfLines={isSingleLine ? 1 : undefined} style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap, styles.dFlex]}>
                {processedTextArray.length !== 0 ? (0, EmojiUtils_1.getProcessedText)(processedTextArray, [styles.emojisWithTextFontSize, styles.emojisWithTextFontFamily]) : fragmentText}
            </Text_1.default>
        </UserDetailsTooltip_1.default>);
}
ReportActionItemMessageHeaderSender.displayName = 'ReportActionItemMessageHeaderSender';
exports.default = ReportActionItemMessageHeaderSender;
