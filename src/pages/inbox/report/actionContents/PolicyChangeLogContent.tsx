import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {
    getAddedApprovalRuleMessage,
    getAddedBudgetMessage,
    getAddedCardFeedMessage,
    getAddedConnectionMessage,
    getAssignedCompanyCardMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCompanyAddressUpdateMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDefaultApproverUpdateMessage,
    getDeletedApprovalRuleMessage,
    getDeletedBudgetMessage,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getForwardsToUpdateMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
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
    getRemovedCardFeedMessage,
    getRemovedConnectionMessage,
    getRenamedCardFeedMessage,
    getSetAutoJoinMessage,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTagListUpdatedMessage,
    getTagListUpdatedRequiredMessage,
    getUnassignedCompanyCardMessage,
    getUpdateACHAccountMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedBudgetMessage,
    getUpdatedCardFeedLiabilityMessage,
    getUpdatedCardFeedStatementPeriodMessage,
    getUpdatedDefaultTitleMessage,
    getUpdatedIndividualBudgetNotificationMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdatedOwnershipMessage,
    getUpdatedProhibitedExpensesMessage,
    getUpdatedReimbursementChoiceMessage,
    getUpdatedSharedBudgetNotificationMessage,
    getUpdatedTimeEnabledMessage,
    getUpdatedTimeRateMessage,
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
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionOfType,
    isTagModificationAction,
} from '@libs/ReportActionsUtils';
import {getWorkspaceNameUpdatedMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PolicyChangeLogContentProps = {
    action: OnyxTypes.ReportAction;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function PolicyChangeLogContent({action, policy}: PolicyChangeLogContentProps) {
    const {translate} = useLocalize();

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        return <ReportActionItemBasicMessage message={translate('workspaceActions.upgradedWorkspace')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
        return (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<muted-text>${translate('workspaceActions.forcedCorporateUpgrade')}</muted-text>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        return <ReportActionItemBasicMessage message={translate('workspaceActions.downgradedWorkspace')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        return <ReportActionItemBasicMessage message={getWorkspaceNameUpdatedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        return <ReportActionItemBasicMessage message={getWorkspaceCurrencyUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        return <ReportActionItemBasicMessage message={getWorkspaceFrequencyUpdateMessage(translate, action)} />;
    }
    if (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME
    ) {
        return <ReportActionItemBasicMessage message={getWorkspaceCategoryUpdateMessage(translate, action, policy)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES)) {
        return <ReportActionItemBasicMessage message={getWorkspaceCategoriesUpdatedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS) {
        return <ReportActionItemBasicMessage message={translate('workspaceActions.importTags')} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS) {
        return <ReportActionItemBasicMessage message={translate('workspaceActions.deletedAllTags')} />;
    }
    if (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX ||
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX
    ) {
        return <ReportActionItemBasicMessage message={getWorkspaceTaxUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME) {
        return <ReportActionItemBasicMessage message={getCustomTaxNameUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX) {
        return <ReportActionItemBasicMessage message={getCurrencyDefaultTaxUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX) {
        return <ReportActionItemBasicMessage message={getForeignCurrencyDefaultTaxUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
        return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListNameUpdatedMessage(translate, action))} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST) {
        return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListUpdatedMessage(translate, action))} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED) {
        return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListUpdatedRequiredMessage(translate, action))} />;
    }
    if (isTagModificationAction(action.actionName)) {
        return <ReportActionItemBasicMessage message={getCleanedTagName(getWorkspaceTagUpdateMessage(translate, action))} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitUpdatedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateImportedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateAddedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateUpdatedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateDeletedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitSubRateUpdatedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE) {
        return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitSubRateDeletedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
        return <ReportActionItemBasicMessage message={getWorkspaceReportFieldAddMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
        return <ReportActionItemBasicMessage message={getWorkspaceReportFieldUpdateMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
        return <ReportActionItemBasicMessage message={getWorkspaceReportFieldDeleteMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD)) {
        return <ReportActionItemBasicMessage message={getWorkspaceUpdateFieldMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED)) {
        return <ReportActionItemBasicMessage message={getWorkspaceFeatureEnabledMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED)) {
        return <ReportActionItemBasicMessage message={getWorkspaceAttendeeTrackingUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER)) {
        return <ReportActionItemBasicMessage message={getDefaultApproverUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO)) {
        return <ReportActionItemBasicMessage message={getSubmitsToUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO)) {
        return <ReportActionItemBasicMessage message={getForwardsToUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED)) {
        return <ReportActionItemBasicMessage message={getAutoPayApprovedReportsEnabledMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT)) {
        return <ReportActionItemBasicMessage message={getAutoReimbursementMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME)) {
        return <ReportActionItemBasicMessage message={getInvoiceCompanyNameUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE)) {
        return <ReportActionItemBasicMessage message={getInvoiceCompanyWebsiteUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER)) {
        return <ReportActionItemBasicMessage message={getReimburserUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED)) {
        return <ReportActionItemBasicMessage message={getWorkspaceReimbursementUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT)) {
        return <ReportActionItemBasicMessage message={getUpdateACHAccountMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS)) {
        return <ReportActionItemBasicMessage message={getCompanyAddressUpdateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAgeMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultBillableMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultReimbursableMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultTitleEnforcedMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogAddEmployeeMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogUpdateEmployee(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
        return <ReportActionItemBasicMessage message={getPolicyChangeLogDeleteMemberMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
        return <ReportActionItemBasicMessage message={getAddedApprovalRuleMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
        return <ReportActionItemBasicMessage message={getDeletedApprovalRuleMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
        return <ReportActionItemBasicMessage message={getUpdatedApprovalRuleMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
        return <ReportActionItemBasicMessage message={getAddedConnectionMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return <ReportActionItemBasicMessage message={getRemovedConnectionMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED)) {
        return <ReportActionItemBasicMessage message={getAddedCardFeedMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED)) {
        return <ReportActionItemBasicMessage message={getRemovedCardFeedMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED)) {
        return <ReportActionItemBasicMessage message={getRenamedCardFeedMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD)) {
        return <ReportActionItemBasicMessage message={getAssignedCompanyCardMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD)) {
        return <ReportActionItemBasicMessage message={getUnassignedCompanyCardMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY)) {
        return <ReportActionItemBasicMessage message={getUpdatedCardFeedLiabilityMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD)) {
        return <ReportActionItemBasicMessage message={getUpdatedCardFeedStatementPeriodMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
        return <ReportActionItemBasicMessage message={getUpdatedAuditRateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
        return <ReportActionItemBasicMessage message={getUpdatedManualApprovalThresholdMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET)) {
        return <ReportActionItemBasicMessage message={getAddedBudgetMessage(translate, action, policy)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET)) {
        return <ReportActionItemBasicMessage message={getUpdatedBudgetMessage(translate, action, policy)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET)) {
        return <ReportActionItemBasicMessage message={getDeletedBudgetMessage(translate, action, policy)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED)) {
        return <ReportActionItemBasicMessage message={getUpdatedTimeEnabledMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE)) {
        return <ReportActionItemBasicMessage message={getUpdatedTimeRateMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES)) {
        return <ReportActionItemBasicMessage message={getUpdatedProhibitedExpensesMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE)) {
        return <ReportActionItemBasicMessage message={getUpdatedReimbursementChoiceMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN)) {
        return <ReportActionItemBasicMessage message={getSetAutoJoinMessage(translate, action)} />;
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE)) {
        return <ReportActionItemBasicMessage message={getUpdatedDefaultTitleMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING) {
        return <ReportActionItemBasicMessage message={getUpdatedAutoHarvestingMessage(translate, action)} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getUpdatedIndividualBudgetNotificationMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getUpdatedSharedBudgetNotificationMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP)) {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getUpdatedOwnershipMessage(translate, action, policy)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }
    // LEAVE_ROOM covers both ROOM_CHANGE_LOG.LEAVE_ROOM and POLICY_CHANGE_LOG.LEAVE_ROOM
    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM)) {
        return <ReportActionItemBasicMessage message={translate('report.actions.type.leftTheChat')} />;
    }

    // Fallback — should not be reached if the dispatch guard is correct
    return null;
}

PolicyChangeLogContent.displayName = 'PolicyChangeLogContent';

export default PolicyChangeLogContent;
