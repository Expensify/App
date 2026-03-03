import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from '@libs/LocalePhoneNumber';
import {getForReportActionTemp} from '@libs/ModifiedExpenseMessage';
import Parser from '@libs/Parser';
import {getCleanedTagName, isPolicyAdmin} from '@libs/PolicyUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {
    getActionableCardFraudAlertMessage,
    getActionableMentionWhisperMessage,
    getAddedApprovalRuleMessage,
    getAddedBudgetMessage,
    getAddedConnectionMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBrokenMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDefaultApproverUpdateMessage,
    getDeletedApprovalRuleMessage,
    getDeletedBudgetMessage,
    getDismissedViolationMessageText,
    getDynamicExternalWorkflowRoutedMessage,
    getExportIntegrationMessageHTML,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getForwardsToUpdateMessage,
    getHarvestCreatedExpenseReportMessage,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getIOUReportIDFromReportActionPreview,
    getJoinRequestMessage,
    getMarkedReimbursedMessage,
    getMemberChangeMessageFragment,
    getMessageOfOldDotReportAction,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getReimburserUpdateMessage,
    getRemovedConnectionMessage,
    getRenamedAction,
    getReportActionMessageText,
    getRoomAvatarUpdatedMessage,
    getSetAutoJoinMessage,
    getSettlementAccountLockedMessage,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTagListUpdatedMessage,
    getTagListUpdatedRequiredMessage,
    getTravelUpdateMessage,
    getUpdateACHAccountMessage,
    getUpdatedAuditRateMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedBudgetMessage,
    getUpdatedDefaultTitleMessage,
    getUpdatedIndividualBudgetNotificationMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdatedOwnershipMessage,
    getUpdatedProhibitedExpensesMessage,
    getUpdatedReimbursementChoiceMessage,
    getUpdatedSharedBudgetNotificationMessage,
    getUpdatedTimeEnabledMessage,
    getUpdatedTimeRateMessage,
    getUpdateRoomDescriptionMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoriesUpdatedMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateImportedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitSubRateDeletedMessage,
    getWorkspaceCustomUnitSubRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isActionableTrackExpense,
    isActionOfType,
    isCardIssuedAction,
    isCreatedTaskReportAction,
    isMarkAsClosedAction,
    isMemberChangeAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isOldDotReportAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportActionAttachment,
    isReportPreviewAction as isReportPreviewActionReportActionsUtils,
    isTagModificationAction,
    isTaskAction as isTaskActionReportActionsUtils,
    isUnapprovedAction,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    getDeletedTransactionMessage,
    getIOUReportActionDisplayMessage,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getPolicyChangeMessage,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getReportName as getReportNameDeprecated,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getUnreportedTransactionMessage,
    getWorkspaceNameUpdatedMessage,
    isExpenseReport,
} from '@libs/ReportUtils';
import {getTaskCreatedMessage, getTaskReportActionMessage} from '@libs/TaskUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Card, Policy, PolicyTagLists, ReportAction, Transaction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import {getActionHtml} from './actionConfig';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyMessageClipboardParams = {
    reportAction: ReportAction;
    transaction: OnyxEntry<Transaction>;
    selection: string;
    report: OnyxEntry<ReportType>;
    card: Card | undefined;
    originalReport: OnyxEntry<ReportType>;
    isHarvestReport: boolean;
    isTryNewDotNVPDismissed: boolean;
    movedFromReport: OnyxEntry<ReportType>;
    movedToReport: OnyxEntry<ReportType>;
    childReport: OnyxEntry<ReportType>;
    policy: OnyxEntry<Policy>;
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'];
    policyTags: OnyxEntry<PolicyTagLists>;
    translate: LocalizedTranslate;
    harvestReport: OnyxEntry<ReportType>;
    currentUserPersonalDetails: ReturnType<typeof useCurrentUserPersonalDetails>;
};

type CopyMessageActionParams = BaseContextMenuActionParams &
    CopyMessageClipboardParams & {
        interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
        copyIcon: IconAsset;
        checkmarkIcon: IconAsset;
    };

function setClipboardMessage(content: string | undefined) {
    if (!content) {
        return;
    }
    const clipboardText = getClipboardText(content);
    if (!Clipboard.canSetHtml()) {
        Clipboard.setString(clipboardText);
    } else {
        Clipboard.setHtml(content, clipboardText);
    }
}

export function copyMessageToClipboard(params: CopyMessageClipboardParams) {
    const {
        reportAction,
        transaction,
        selection,
        report,
        card,
        originalReport,
        isHarvestReport = false,
        isTryNewDotNVPDismissed = false,
        movedFromReport,
        movedToReport,
        childReport,
        policy,
        getLocalDateFromDatetime,
        policyTags,
        translate,
        harvestReport,
        currentUserPersonalDetails,
    } = params;

    const isReportPreviewAction = isReportPreviewActionReportActionsUtils(reportAction);
    const messageHtml = getActionHtml(reportAction);
    const messageText = getReportActionMessageText(reportAction);
    const isAttachment = isReportActionAttachment(reportAction);

    if (!isAttachment) {
        const content = selection || messageHtml;
        if (isReportPreviewAction) {
            const iouReportID = getIOUReportIDFromReportActionPreview(reportAction);
            const displayMessage = getReportPreviewMessage(iouReportID, reportAction, undefined, undefined, undefined, undefined, undefined, true);
            Clipboard.setString(displayMessage);
        } else if (isTaskActionReportActionsUtils(reportAction)) {
            const {text, html} = getTaskReportActionMessage(translate, reportAction);
            const displayMessage = html ?? text;
            setClipboardMessage(displayMessage);
        } else if (isModifiedExpenseAction(reportAction)) {
            const modifyExpenseMessage = getForReportActionTemp({
                translate,
                reportAction,
                policy,
                movedFromReport,
                movedToReport,
                policyTags,
                currentUserLogin: (currentUserPersonalDetails as {email?: string})?.email ?? (currentUserPersonalDetails as {login?: string})?.login ?? '',
            });
            Clipboard.setString(modifyExpenseMessage);
        } else if (isReimbursementDeQueuedOrCanceledAction(reportAction)) {
            const displayMessage = getReimbursementDeQueuedOrCanceledActionMessage(translate, reportAction, report);
            Clipboard.setString(displayMessage);
        } else if (isMoneyRequestAction(reportAction)) {
            const displayMessage = getIOUReportActionDisplayMessage(translate, reportAction, transaction, report);
            if (displayMessage === Parser.htmlToText(displayMessage)) {
                Clipboard.setString(displayMessage);
            } else {
                setClipboardMessage(displayMessage);
            }
        } else if (isCreatedTaskReportAction(reportAction)) {
            const taskPreviewMessage = getTaskCreatedMessage(translate, reportAction, childReport, true);
            Clipboard.setString(taskPreviewMessage);
        } else if (isMemberChangeAction(reportAction)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const logMessage = getMemberChangeMessageFragment(translate, reportAction, getReportNameDeprecated).html ?? '';
            setClipboardMessage(logMessage);
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
            Clipboard.setString(Str.htmlDecode(getWorkspaceNameUpdatedMessage(translate, reportAction)));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION) {
            Clipboard.setString(getWorkspaceDescriptionUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
            Clipboard.setString(getWorkspaceCurrencyUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
            Clipboard.setString(getWorkspaceFrequencyUpdateMessage(translate, reportAction));
        } else if (
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME
        ) {
            Clipboard.setString(getWorkspaceCategoryUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES) {
            Clipboard.setString(getWorkspaceCategoriesUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS) {
            Clipboard.setString(translate('workspaceActions.importTags'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS) {
            Clipboard.setString(translate('workspaceActions.deletedAllTags'));
        } else if (
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX ||
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX ||
            reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX
        ) {
            Clipboard.setString(getWorkspaceTaxUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME) {
            Clipboard.setString(getCustomTaxNameUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX) {
            Clipboard.setString(getCurrencyDefaultTaxUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX) {
            Clipboard.setString(getForeignCurrencyDefaultTaxUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
            Clipboard.setString(getCleanedTagName(getTagListNameUpdatedMessage(translate, reportAction)));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST) {
            Clipboard.setString(getCleanedTagName(getTagListUpdatedMessage(translate, reportAction)));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED) {
            Clipboard.setString(getCleanedTagName(getTagListUpdatedRequiredMessage(translate, reportAction)));
        } else if (isTagModificationAction(reportAction.actionName)) {
            Clipboard.setString(getCleanedTagName(getWorkspaceTagUpdateMessage(translate, reportAction)));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
            Clipboard.setString(getWorkspaceCustomUnitUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES) {
            Clipboard.setString(getWorkspaceCustomUnitRateImportedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
            Clipboard.setString(getWorkspaceCustomUnitRateAddedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
            Clipboard.setString(getWorkspaceCustomUnitRateUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            Clipboard.setString(getWorkspaceCustomUnitRateDeletedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE) {
            Clipboard.setString(getWorkspaceCustomUnitSubRateUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE) {
            Clipboard.setString(getWorkspaceCustomUnitSubRateDeletedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
            Clipboard.setString(getWorkspaceReportFieldAddMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
            Clipboard.setString(getWorkspaceReportFieldUpdateMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
            Clipboard.setString(getWorkspaceReportFieldDeleteMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
            setClipboardMessage(getWorkspaceUpdateFieldMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
            Clipboard.setString(getWorkspaceFeatureEnabledMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED) {
            Clipboard.setString(getWorkspaceAttendeeTrackingUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER) {
            Clipboard.setString(getDefaultApproverUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO) {
            Clipboard.setString(getSubmitsToUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO) {
            Clipboard.setString(getForwardsToUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED) {
            Clipboard.setString(getAutoPayApprovedReportsEnabledMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT) {
            Clipboard.setString(getAutoReimbursementMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME) {
            Clipboard.setString(getInvoiceCompanyNameUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE) {
            Clipboard.setString(getInvoiceCompanyWebsiteUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER) {
            Clipboard.setString(getReimburserUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED) {
            Clipboard.setString(getWorkspaceReimbursementUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
            Clipboard.setString(getUpdateACHAccountMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS) {
            Clipboard.setString(getCompanyAddressUpdateMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT) {
            Clipboard.setString(getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT) {
            Clipboard.setString(getPolicyChangeLogMaxExpenseAmountMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE) {
            Clipboard.setString(getPolicyChangeLogMaxExpenseAgeMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE) {
            Clipboard.setString(getPolicyChangeLogDefaultBillableMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE) {
            Clipboard.setString(getPolicyChangeLogDefaultReimbursableMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED) {
            Clipboard.setString(getPolicyChangeLogDefaultTitleEnforcedMessage(translate, reportAction));
        } else if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP) {
            setClipboardMessage(Parser.htmlToText(getUpdatedOwnershipMessage(translate, reportAction, policy) ?? ''));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
            setClipboardMessage(getUnreportedTransactionMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
            Clipboard.setString(getMarkedReimbursedMessage(translate, reportAction));
        } else if (isReimbursementQueuedAction(reportAction)) {
            Clipboard.setString(getReimbursementQueuedActionMessage({reportAction, translate, formatPhoneNumber: formatPhoneNumberPhoneUtils, report, shouldUseShortDisplayName: false}));
        } else if (isActionableMentionWhisper(reportAction)) {
            const mentionWhisperMessage = getActionableMentionWhisperMessage(translate, reportAction);
            setClipboardMessage(mentionWhisperMessage);
        } else if (isActionableTrackExpense(reportAction)) {
            setClipboardMessage(CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE);
        } else if (isRenamedAction(reportAction)) {
            setClipboardMessage(getRenamedAction(translate, reportAction, isExpenseReport(report)));
        } else if (
            isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
            isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
            isMarkAsClosedAction(reportAction)
        ) {
            const harvesting = !isMarkAsClosedAction(reportAction) ? (getOriginalMessage(reportAction)?.harvesting ?? false) : false;
            if (harvesting) {
                setClipboardMessage(translate('iou.automaticallySubmitted'));
            } else {
                Clipboard.setString(translate('iou.submitted', getOriginalMessage(reportAction)?.message));
            }
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
            const {automaticAction} = getOriginalMessage(reportAction) ?? {};
            if (automaticAction) {
                setClipboardMessage(translate('iou.automaticallyApproved'));
            } else {
                Clipboard.setString(translate('iou.approvedMessage'));
            }
        } else if (isUnapprovedAction(reportAction)) {
            Clipboard.setString(translate('iou.unapproved'));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
            const {automaticAction} = getOriginalMessage(reportAction) ?? {};
            if (automaticAction) {
                setClipboardMessage(translate('iou.automaticallyForwarded'));
            } else {
                Clipboard.setString(translate('iou.forwarded'));
            }
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
            Clipboard.setString(translate('iou.rejectedThisReport'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
            const displayMessage = translate('workspaceActions.upgradedWorkspace');
            Clipboard.setString(displayMessage);
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
            const displayMessage = Parser.htmlToText(translate('workspaceActions.forcedCorporateUpgrade'));
            Clipboard.setString(displayMessage);
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
            Clipboard.setString(translate('workspaceActions.downgradedWorkspace'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
            Clipboard.setString(translate('iou.heldExpense'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
            Clipboard.setString(translate('iou.unheldExpense'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
            Clipboard.setString(translate('iou.reject.reportActions.rejectedExpense'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
            Clipboard.setString(translate('iou.reject.reportActions.markedAsResolved'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            Clipboard.setString(translate('iou.retracted'));
        } else if (isOldDotReportAction(reportAction)) {
            const oldDotActionMessage = getMessageOfOldDotReportAction(translate, reportAction);
            Clipboard.setString(oldDotActionMessage);
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION) {
            const originalMessage = getOriginalMessage(reportAction) as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage'];
            Clipboard.setString(getDismissedViolationMessageText(translate, originalMessage));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
            Clipboard.setString(translate('violations.resolvedDuplicates'));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
            setClipboardMessage(getExportIntegrationMessageHTML(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
            setClipboardMessage(getUpdateRoomDescriptionMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR) {
            setClipboardMessage(getRoomAvatarUpdatedMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            setClipboardMessage(getPolicyChangeLogAddEmployeeMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            setClipboardMessage(getPolicyChangeLogUpdateEmployee(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            setClipboardMessage(getPolicyChangeLogDeleteMemberMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
            setClipboardMessage(getDeletedTransactionMessage(translate, reportAction));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            setClipboardMessage(translate('iou.reopened'));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            setClipboardMessage(getIntegrationSyncFailedMessage(translate, reportAction, report?.policyID, isTryNewDotNVPDismissed));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
            setClipboardMessage(getCompanyCardConnectionBrokenMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
            setClipboardMessage(getPlaidBalanceFailureMessage(translate, reportAction));
        } else if (isCardIssuedAction(reportAction)) {
            const shouldNavigateToCardDetails = isPolicyAdmin(policy, currentUserPersonalDetails.login);
            setClipboardMessage(getCardIssuedMessage({reportAction, shouldRenderHTML: true, shouldNavigateToCardDetails, policyID: report?.policyID, expensifyCard: card, translate}));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
            setClipboardMessage(getAddedConnectionMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
            setClipboardMessage(getRemovedConnectionMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            setClipboardMessage(getTravelUpdateMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
            setClipboardMessage(getUpdatedAuditRateMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
            setClipboardMessage(getAddedApprovalRuleMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
            setClipboardMessage(getDeletedApprovalRuleMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
            setClipboardMessage(getUpdatedApprovalRuleMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
            setClipboardMessage(getUpdatedManualApprovalThresholdMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET)) {
            setClipboardMessage(getAddedBudgetMessage(translate, reportAction, policy));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET)) {
            setClipboardMessage(getUpdatedBudgetMessage(translate, reportAction, policy));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET)) {
            setClipboardMessage(getDeletedBudgetMessage(translate, reportAction, policy));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED)) {
            setClipboardMessage(getUpdatedTimeEnabledMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE)) {
            setClipboardMessage(getUpdatedTimeRateMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES)) {
            setClipboardMessage(getUpdatedProhibitedExpensesMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE)) {
            setClipboardMessage(getUpdatedReimbursementChoiceMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN)) {
            setClipboardMessage(getSetAutoJoinMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE)) {
            setClipboardMessage(getUpdatedDefaultTitleMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING)) {
            setClipboardMessage(getUpdatedAutoHarvestingMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION)) {
            setClipboardMessage(getUpdatedIndividualBudgetNotificationMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION)) {
            setClipboardMessage(getUpdatedSharedBudgetNotificationMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            setClipboardMessage(getChangedApproverActionMessage(translate, reportAction));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
            setClipboardMessage(getMovedTransactionMessage(translate, reportAction));
        } else if (isMovedAction(reportAction)) {
            setClipboardMessage(getMovedActionMessage(translate, reportAction, originalReport));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT)) {
            setClipboardMessage(getActionableCardFraudAlertMessage(translate, reportAction, getLocalDateFromDatetime));
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
            const displayMessage = getPolicyChangeMessage(translate, reportAction);
            Clipboard.setString(displayMessage);
        } else if (isActionableJoinRequest(reportAction)) {
            const displayMessage = getJoinRequestMessage(translate, policy, reportAction);
            Clipboard.setString(displayMessage);
        } else if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM || reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM) {
            Clipboard.setString(translate('report.actions.type.leftTheChat'));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED)) {
            setClipboardMessage(getDynamicExternalWorkflowRoutedMessage(reportAction, translate));
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED) && isHarvestReport) {
            const harvestReportName = getReportName(harvestReport);
            const displayMessage = getHarvestCreatedExpenseReportMessage(harvestReport?.reportID, harvestReportName, translate);
            setClipboardMessage(displayMessage);
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
            const {originalID} = getOriginalMessage(reportAction) ?? {};
            const reportName = getReportName(getReportOrDraftReport(originalID));
            const displayMessage = getCreatedReportForUnapprovedTransactionsMessage(originalID, reportName, translate);
            setClipboardMessage(displayMessage);
        } else if (content) {
            setClipboardMessage(
                content.replaceAll(/(<mention-user>)(.*?)(<\/mention-user>)/gi, (match, openTag: string, innerContent: string, closeTag: string): string => {
                    const modifiedContent = Str.removeSMSDomain(innerContent) || '';
                    return openTag + modifiedContent + closeTag || '';
                }),
            );
        } else if (isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
            setClipboardMessage(getSettlementAccountLockedMessage(translate, reportAction));
        } else if (messageText) {
            Clipboard.setString(messageText);
        }
    }
}

function createCopyMessageAction({interceptAnonymousUser, translate, copyIcon, checkmarkIcon, ...clipboardParams}: CopyMessageActionParams): ContextMenuAction {
    return {
        id: 'copyMessage',
        icon: copyIcon,
        text: translate('reportActionContextMenu.copyMessage'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                copyMessageToClipboard({...clipboardParams, translate});
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE,
    };
}

export default createCopyMessageAction;
export type {CopyMessageActionParams, CopyMessageClipboardParams};
