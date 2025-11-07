import Str from 'expensify-common/dist/str';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useIsArchived from '@hooks/useIsArchived';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getLastActorDisplayNameFromLastVisibleActions, getPersonalDetailsForAccountIDs, shouldShowLastActorDisplayName} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {
    getActionableCardFraudAlertResolutionMessage,
    getAddedApprovalRuleMessage,
    getAddedConnectionMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getDeletedApprovalRuleMessage,
    getIntegrationSyncFailedMessage,
    getLastVisibleMessage,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReopenedMessage,
    getReportActionMessageText,
    getRetractedMessage,
    getRoomAvatarUpdatedMessage,
    getTagListNameUpdatedMessage,
    getTravelUpdateMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdateRoomDescriptionMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionOfType,
    isCardIssuedAction,
    isInviteOrRemovedAction,
    isOldDotReportAction,
    isRenamedAction,
    isTagModificationAction,
    isTaskAction,
} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    excludeParticipantsForDisplay,
    formatReportLastMessageText,
    getParticipantsAccountIDsForDisplay,
    getReportSubtitlePrefix,
    getWorkspaceNameUpdatedMessage,
    isChatRoom,
    isDeprecatedGroupDM,
    isExpenseReport,
    isGroupChat,
    isPolicyExpenseChat,
    isTaskReport,
    isThread,
} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import {getTaskReportActionMessage} from '@libs/TaskUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLastActorDetails from './useLastActorDetails';
import useLastActorDisplayName from './useLastActorDisplayName';
import useLastMessageTextFromReport from './useLastMessageTextFromReport';
import useLastReportAction from './useLastReportAction';

function useOptionAlternateText(reportID: string) {
    const {translate, localeCompare} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const lastAction = useLastReportAction(reportID);
    const lastActorDetails = useLastActorDetails(lastAction, report);
    const lastActorDisplayName = useLastActorDisplayName(lastAction, report);
    const lastMessageTextFromReport = useLastMessageTextFromReport(reportID);
    let lastMessageText = Str.removeSMSDomain(lastMessageTextFromReport);
    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: report?.policyID});
    const isReportArchived = useIsArchived(reportID);
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report);
    const participantAccountIDsExcludeCurrentUser = excludeParticipantsForDisplay(participantAccountIDs, report?.participants ?? {}, reportMetadata, {shouldExcludeCurrentUser: true});
    const participantPersonalDetailListExcludeCurrentUser = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDsExcludeCurrentUser, personalDetails));
    const isThreadMessage = isThread(report) && lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT && lastAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isChatGroup = isGroupChat(report) || isDeprecatedGroupDM(report, isReportArchived);

    let alternateText = '';
    if ((isChatRoom(report) || isPolicyExpenseChat(report) || isThread(report) || isTaskReport(report) || isThreadMessage || isChatGroup) && !isReportArchived) {
        const prefix = getReportSubtitlePrefix(report);

        if (isRenamedAction(lastAction)) {
            return getRenamedAction(lastAction, isExpenseReport(report), lastActorDisplayName);
        }
        if (isTaskAction(lastAction)) {
            return formatReportLastMessageText(getTaskReportActionMessage(lastAction).text);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            const actionMessage = getReportActionMessageText(lastAction);
            return actionMessage ? `${lastActorDisplayName}: ${actionMessage}` : '';
        }
        if (isInviteOrRemovedAction(lastAction)) {
            const lastActionName = lastAction?.actionName ?? report?.lastActionType;
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            const targetAccountIDs = lastActionOriginalMessage?.targetAccountIDs ?? [];
            const targetAccountIDsLength = targetAccountIDs.length !== 0 ? targetAccountIDs.length : (report?.lastMessageHtml?.match(/<mention-user[^>]*><\/mention-user>/g)?.length ?? 0);
            const verb =
                lastActionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || lastActionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM
                    ? translate('workspace.invite.invited')
                    : translate('workspace.invite.removed');
            const users = translate(targetAccountIDsLength > 1 ? 'common.members' : 'common.member')?.toLocaleLowerCase();

            return formatReportLastMessageText(`${lastActorDisplayName ?? lastActorDisplayName}: ${verb} ${targetAccountIDsLength} ${users}`);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME)) {
            return getWorkspaceNameUpdatedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(lastAction)?.resolution) {
            return getActionableCardFraudAlertResolutionMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
            return getWorkspaceDescriptionUpdatedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY)) {
            return getWorkspaceCurrencyUpdateMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY)) {
            return getWorkspaceFrequencyUpdateMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE)) {
            return translate('workspaceActions.upgradedWorkspace');
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE)) {
            return translate('workspaceActions.downgradedWorkspace');
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            return Parser.htmlToText(getIntegrationSyncFailedMessage(lastAction, report?.policyID));
        }
        if (
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY) ||
            isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME)
        ) {
            return getWorkspaceCategoryUpdateMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME)) {
            return getCleanedTagName(getTagListNameUpdatedMessage(lastAction) ?? '');
        }
        if (isTagModificationAction(lastAction?.actionName ?? '')) {
            return getCleanedTagName(getWorkspaceTagUpdateMessage(lastAction) ?? '');
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT)) {
            return getWorkspaceCustomUnitUpdatedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
            return getWorkspaceCustomUnitRateAddedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
            return getWorkspaceCustomUnitRateUpdatedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
            return getWorkspaceCustomUnitRateDeletedMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD)) {
            return getWorkspaceReportFieldAddMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD)) {
            return getWorkspaceReportFieldUpdateMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD)) {
            return getWorkspaceReportFieldDeleteMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            return getWorkspaceUpdateFieldMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            return getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            return getPolicyChangeLogMaxExpenseAmountMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            return getPolicyChangeLogDefaultBillableMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
            return getPolicyChangeLogDefaultReimbursableMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            return getPolicyChangeLogDefaultTitleEnforcedMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY) {
            return getPolicyChangeLogEmployeeLeftMessage(lastAction, true);
        }
        if (isCardIssuedAction(lastAction)) {
            return getCardIssuedMessage({reportAction: lastAction, expensifyCard: card});
        }
        if (lastAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && lastActorDisplayName && lastMessageTextFromReport) {
            const displayName = (lastMessageTextFromReport.length > 0 && getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails)) || lastActorDisplayName;
            return formatReportLastMessageText(`${displayName}: ${lastMessageText}`);
        }
        if (lastAction && isOldDotReportAction(lastAction)) {
            return getMessageOfOldDotReportAction(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
            return getUpdateRoomDescriptionMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
            return getRoomAvatarUpdatedMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            return getPolicyChangeLogAddEmployeeMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            return getPolicyChangeLogUpdateEmployee(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            return getPolicyChangeLogDeleteMemberMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            return getReportActionMessageText(lastAction) ?? '';
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION) {
            return getAddedConnectionMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION) {
            return getRemovedConnectionMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE) {
            return getUpdatedAuditRateMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE) {
            return getAddedApprovalRuleMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE) {
            return getDeletedApprovalRuleMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE) {
            return getUpdatedApprovalRuleMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD) {
            return getUpdatedManualApprovalThresholdMessage(lastAction);
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            return getRetractedMessage();
        }
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            return getReopenedMessage();
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            return getTravelUpdateMessage(lastAction);
        }
        if (isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(lastAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            return Parser.htmlToText(getChangedApproverActionMessage(lastAction));
        }
        if (lastMessageTextFromReport.length > 0) {
            alternateText = formatReportLastMessageText(Parser.htmlToText(lastMessageText));
        } else {
            const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
            alternateText = getLastVisibleMessage(report?.reportID, canPerformWriteAction, {}, lastAction)?.lastMessageText;
        }

        if (!alternateText) {
            alternateText = formatReportLastMessageText(
                SidebarUtils.getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, localeCompare, isReportArchived).messageText ??
                    translate('report.noActivityYet'),
            );
        }

        return prefix + alternateText;
    }
    if (!lastMessageText) {
        lastMessageText = formatReportLastMessageText(
            SidebarUtils.getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, localeCompare, isReportArchived).messageText ?? translate('report.noActivityYet'),
        );
    }
    if (shouldShowLastActorDisplayName(report, lastActorDetails, lastAction) && !isReportArchived) {
        const displayName = (lastMessageTextFromReport.length > 0 && getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails)) || lastActorDisplayName;
        return `${displayName}: ${formatReportLastMessageText(lastMessageText)}`;
    }
    return formatReportLastMessageText(lastMessageText);
}
export default useOptionAlternateText;
