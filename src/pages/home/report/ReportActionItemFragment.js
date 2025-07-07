"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var convertToLTR_1 = require("@libs/convertToLTR");
var isReportMessageAttachment_1 = require("@libs/isReportMessageAttachment");
var CONST_1 = require("@src/CONST");
var AttachmentCommentFragment_1 = require("./comment/AttachmentCommentFragment");
var TextCommentFragment_1 = require("./comment/TextCommentFragment");
var ReportActionItemMessageHeaderSender_1 = require("./ReportActionItemMessageHeaderSender");
var MUTED_ACTIONS = __spreadArray(__spreadArray([], Object.values(CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG), true), [
    CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
    CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED,
    CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED,
    CONST_1.default.REPORT.ACTIONS.TYPE.UNAPPROVED,
    CONST_1.default.REPORT.ACTIONS.TYPE.MOVED,
    CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
], false);
function ReportActionItemFragment(_a) {
    var _b, _c, _d;
    var reportActionID = _a.reportActionID, pendingAction = _a.pendingAction, actionName = _a.actionName, fragment = _a.fragment, accountID = _a.accountID, _e = _a.iouMessage, iouMessage = _e === void 0 ? '' : _e, _f = _a.isSingleLine, isSingleLine = _f === void 0 ? false : _f, _g = _a.source, source = _g === void 0 ? '' : _g, _h = _a.style, style = _h === void 0 ? [] : _h, _j = _a.delegateAccountID, delegateAccountID = _j === void 0 ? 0 : _j, actorIcon = _a.actorIcon, _k = _a.isThreadParentMessage, isThreadParentMessage = _k === void 0 ? false : _k, _l = _a.isApprovedOrSubmittedReportAction, isApprovedOrSubmittedReportAction = _l === void 0 ? false : _l, _m = _a.isHoldReportAction, isHoldReportAction = _m === void 0 ? false : _m, _o = _a.isFragmentContainingDisplayName, isFragmentContainingDisplayName = _o === void 0 ? false : _o, _p = _a.displayAsGroup, displayAsGroup = _p === void 0 ? false : _p, moderationDecision = _a.moderationDecision, _q = _a.shouldShowTooltip, shouldShowTooltip = _q === void 0 ? true : _q;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    switch (fragment === null || fragment === void 0 ? void 0 : fragment.type) {
        case 'COMMENT': {
            var isPendingDelete = pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            // Threaded messages display "[Deleted message]" instead of being hidden altogether.
            // While offline we display the previous message with a strikethrough style. Once online we want to
            // immediately display "[Deleted message]" while the delete action is pending.
            if ((!isOffline && isThreadParentMessage && isPendingDelete) || (fragment === null || fragment === void 0 ? void 0 : fragment.isDeletedParentAction)) {
                return <RenderHTML_1.default html={"<deleted-action>".concat(translate('parentReportAction.deletedMessage'), "</deleted-action>")}/>;
            }
            if (isThreadParentMessage && moderationDecision === CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE) {
                return <RenderHTML_1.default html={"<deleted-action ".concat(CONST_1.default.HIDDEN_MESSAGE_ATTRIBUTE, "=\"true\">").concat(translate('parentReportAction.hiddenMessage'), "</deleted-action>")}/>;
            }
            if ((0, isReportMessageAttachment_1.isReportMessageAttachment)(fragment)) {
                return (<AttachmentCommentFragment_1.default reportActionID={reportActionID} source={source} html={(_b = fragment === null || fragment === void 0 ? void 0 : fragment.html) !== null && _b !== void 0 ? _b : ''} addExtraMargin={!displayAsGroup} styleAsDeleted={!!(isOffline && isPendingDelete)}/>);
            }
            return (<TextCommentFragment_1.default reportActionID={reportActionID} source={source} fragment={fragment} styleAsDeleted={!!(isOffline && isPendingDelete)} styleAsMuted={!!actionName && MUTED_ACTIONS.includes(actionName)} iouMessage={iouMessage} displayAsGroup={displayAsGroup} style={style}/>);
        }
        case 'TEXT': {
            if (isApprovedOrSubmittedReportAction) {
                return (<Text_1.default numberOfLines={isSingleLine ? 1 : undefined} style={[styles.chatItemMessage, styles.colorMuted]}>
                        {isFragmentContainingDisplayName ? (0, convertToLTR_1.default)((_c = fragment === null || fragment === void 0 ? void 0 : fragment.text) !== null && _c !== void 0 ? _c : '') : fragment === null || fragment === void 0 ? void 0 : fragment.text}
                    </Text_1.default>);
            }
            if (isHoldReportAction) {
                return (<Text_1.default numberOfLines={isSingleLine ? 1 : undefined} style={[styles.chatItemMessage]}>
                        {isFragmentContainingDisplayName ? (0, convertToLTR_1.default)((_d = fragment === null || fragment === void 0 ? void 0 : fragment.text) !== null && _d !== void 0 ? _d : '') : fragment === null || fragment === void 0 ? void 0 : fragment.text}
                    </Text_1.default>);
            }
            return (<ReportActionItemMessageHeaderSender_1.default accountID={accountID} delegateAccountID={delegateAccountID} fragmentText={fragment.text} actorIcon={actorIcon} isSingleLine={isSingleLine} shouldShowTooltip={shouldShowTooltip}/>);
        }
        case 'LINK':
            return <Text_1.default>LINK</Text_1.default>;
        case 'INTEGRATION_COMMENT':
            return <Text_1.default>REPORT_LINK</Text_1.default>;
        case 'REPORT_LINK':
            return <Text_1.default>REPORT_LINK</Text_1.default>;
        case 'POLICY_LINK':
            return <Text_1.default>POLICY_LINK</Text_1.default>;
        // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the
        // new data structure. So we simply set this message as inner html and render it like we did before.
        // This wil allow us to convert messages over to the new structure without needing to do it all at once.
        case 'OLD_MESSAGE':
            return <Text_1.default>OLD_MESSAGE</Text_1.default>;
        default:
            return <Text_1.default>fragment.text</Text_1.default>;
    }
}
ReportActionItemFragment.displayName = 'ReportActionItemFragment';
exports.default = (0, react_1.memo)(ReportActionItemFragment);
