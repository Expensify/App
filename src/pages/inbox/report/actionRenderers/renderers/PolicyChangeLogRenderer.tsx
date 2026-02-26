import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {getCleanedTagName} from '@libs/PolicyUtils';
import {
    getAddedApprovalRuleMessage,
    getAddedConnectionMessage,
    getAutoPayApprovedReportsEnabledMessage,
    getAutoReimbursementMessage,
    getCompanyAddressUpdateMessage,
    getDefaultApproverUpdateMessage,
    getDeletedApprovalRuleMessage,
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
    getRemovedConnectionMessage,
    getSetAutoJoinMessage,
    getSubmitsToUpdateMessage,
    getTagListNameUpdatedMessage,
    getTagListUpdatedMessage,
    getTagListUpdatedRequiredMessage,
    getUpdateACHAccountMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedDefaultTitleMessage,
    getUpdatedIndividualBudgetNotificationMessage,
    getUpdatedManualApprovalThresholdMessage,
    getUpdatedProhibitedExpensesMessage,
    getUpdatedReimbursementChoiceMessage,
    getUpdatedSharedBudgetNotificationMessage,
    getUpdatedTimeEnabledMessage,
    getUpdatedTimeRateMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoriesUpdatedMessage,
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
    isTagModificationAction,
} from '@libs/ReportActionsUtils';
import {getWorkspaceNameUpdatedMessage} from '@libs/ReportUtils';
import type ActionRendererProps from '@pages/inbox/report/actionRenderers/types';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';

const PCL = CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG;

function PolicyChangeLogRenderer({action}: ActionRendererProps) {
    const {translate} = useLocalize();

    switch (action.actionName) {
        case PCL.UPDATE_NAME:
            return <ReportActionItemBasicMessage message={getWorkspaceNameUpdatedMessage(translate, action)} />;

        case PCL.UPDATE_CURRENCY:
            return <ReportActionItemBasicMessage message={getWorkspaceCurrencyUpdateMessage(translate, action)} />;

        case PCL.UPDATE_AUTO_REPORTING_FREQUENCY:
            return <ReportActionItemBasicMessage message={getWorkspaceFrequencyUpdateMessage(translate, action)} />;

        case PCL.UPDATE_CATEGORIES:
            return <ReportActionItemBasicMessage message={getWorkspaceCategoriesUpdatedMessage(translate, action)} />;

        case PCL.IMPORT_TAGS:
            return <ReportActionItemBasicMessage message={translate('workspaceActions.importTags')} />;

        case PCL.DELETE_ALL_TAGS:
            return <ReportActionItemBasicMessage message={translate('workspaceActions.deletedAllTags')} />;

        case PCL.ADD_TAX:
        case PCL.DELETE_TAX:
        case PCL.UPDATE_TAX:
            return <ReportActionItemBasicMessage message={getWorkspaceTaxUpdateMessage(translate, action)} />;

        case PCL.UPDATE_TAG_LIST_NAME:
            return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListNameUpdatedMessage(translate, action))} />;

        case PCL.UPDATE_TAG_LIST:
            return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListUpdatedMessage(translate, action))} />;

        case PCL.UPDATE_TAG_LIST_REQUIRED:
            return <ReportActionItemBasicMessage message={getCleanedTagName(getTagListUpdatedRequiredMessage(translate, action))} />;

        case PCL.UPDATE_CUSTOM_UNIT:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitUpdatedMessage(translate, action)} />;

        case PCL.IMPORT_CUSTOM_UNIT_RATES:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateImportedMessage(translate, action)} />;

        case PCL.ADD_CUSTOM_UNIT_RATE:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateAddedMessage(translate, action)} />;

        case PCL.UPDATE_CUSTOM_UNIT_RATE:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateUpdatedMessage(translate, action)} />;

        case PCL.DELETE_CUSTOM_UNIT_RATE:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateDeletedMessage(translate, action)} />;

        case PCL.UPDATE_CUSTOM_UNIT_SUB_RATE:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitSubRateUpdatedMessage(translate, action)} />;

        case PCL.DELETE_CUSTOM_UNIT_SUB_RATE:
            return <ReportActionItemBasicMessage message={getWorkspaceCustomUnitSubRateDeletedMessage(translate, action)} />;

        case PCL.ADD_REPORT_FIELD:
            return <ReportActionItemBasicMessage message={getWorkspaceReportFieldAddMessage(translate, action)} />;

        case PCL.UPDATE_REPORT_FIELD:
            return <ReportActionItemBasicMessage message={getWorkspaceReportFieldUpdateMessage(translate, action)} />;

        case PCL.DELETE_REPORT_FIELD:
            return <ReportActionItemBasicMessage message={getWorkspaceReportFieldDeleteMessage(translate, action)} />;

        case PCL.UPDATE_FIELD:
            return <ReportActionItemBasicMessage message={getWorkspaceUpdateFieldMessage(translate, action)} />;

        case PCL.UPDATE_FEATURE_ENABLED:
            return <ReportActionItemBasicMessage message={getWorkspaceFeatureEnabledMessage(translate, action)} />;

        case PCL.UPDATE_IS_ATTENDEE_TRACKING_ENABLED:
            return <ReportActionItemBasicMessage message={getWorkspaceAttendeeTrackingUpdateMessage(translate, action)} />;

        case PCL.UPDATE_DEFAULT_APPROVER:
            return <ReportActionItemBasicMessage message={getDefaultApproverUpdateMessage(translate, action)} />;

        case PCL.UPDATE_SUBMITS_TO:
            return <ReportActionItemBasicMessage message={getSubmitsToUpdateMessage(translate, action)} />;

        case PCL.UPDATE_FORWARDS_TO:
            return <ReportActionItemBasicMessage message={getForwardsToUpdateMessage(translate, action)} />;

        case PCL.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED:
            return <ReportActionItemBasicMessage message={getAutoPayApprovedReportsEnabledMessage(translate, action)} />;

        case PCL.UPDATE_AUTO_REIMBURSEMENT:
            return <ReportActionItemBasicMessage message={getAutoReimbursementMessage(translate, action)} />;

        case PCL.UPDATE_INVOICE_COMPANY_NAME:
            return <ReportActionItemBasicMessage message={getInvoiceCompanyNameUpdateMessage(translate, action)} />;

        case PCL.UPDATE_INVOICE_COMPANY_WEBSITE:
            return <ReportActionItemBasicMessage message={getInvoiceCompanyWebsiteUpdateMessage(translate, action)} />;

        case PCL.UPDATE_REIMBURSER:
            return <ReportActionItemBasicMessage message={getReimburserUpdateMessage(translate, action)} />;

        case PCL.UPDATE_REIMBURSEMENT_ENABLED:
            return <ReportActionItemBasicMessage message={getWorkspaceReimbursementUpdateMessage(translate, action)} />;

        case PCL.UPDATE_ACH_ACCOUNT:
            return <ReportActionItemBasicMessage message={getUpdateACHAccountMessage(translate, action)} />;

        case PCL.UPDATE_ADDRESS:
            return <ReportActionItemBasicMessage message={getCompanyAddressUpdateMessage(translate, action)} />;

        case PCL.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, action)} />;

        case PCL.UPDATE_MAX_EXPENSE_AMOUNT:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountMessage(translate, action)} />;

        case PCL.UPDATE_MAX_EXPENSE_AGE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAgeMessage(translate, action)} />;

        case PCL.UPDATE_DEFAULT_BILLABLE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultBillableMessage(translate, action)} />;

        case PCL.UPDATE_DEFAULT_REIMBURSABLE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultReimbursableMessage(translate, action)} />;

        case PCL.UPDATE_DEFAULT_TITLE_ENFORCED:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultTitleEnforcedMessage(translate, action)} />;

        case PCL.ADD_EMPLOYEE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogAddEmployeeMessage(translate, action)} />;

        case PCL.UPDATE_EMPLOYEE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogUpdateEmployee(translate, action)} />;

        case PCL.DELETE_EMPLOYEE:
            return <ReportActionItemBasicMessage message={getPolicyChangeLogDeleteMemberMessage(translate, action)} />;

        case PCL.ADD_APPROVER_RULE:
            return <ReportActionItemBasicMessage message={getAddedApprovalRuleMessage(translate, action)} />;

        case PCL.DELETE_APPROVER_RULE:
            return <ReportActionItemBasicMessage message={getDeletedApprovalRuleMessage(translate, action)} />;

        case PCL.UPDATE_APPROVER_RULE:
            return <ReportActionItemBasicMessage message={getUpdatedApprovalRuleMessage(translate, action)} />;

        case PCL.ADD_INTEGRATION:
            return <ReportActionItemBasicMessage message={getAddedConnectionMessage(translate, action)} />;

        case PCL.DELETE_INTEGRATION:
            return <ReportActionItemBasicMessage message={getRemovedConnectionMessage(translate, action)} />;

        case PCL.UPDATE_AUDIT_RATE:
            return <ReportActionItemBasicMessage message={getUpdatedAuditRateMessage(translate, action)} />;

        case PCL.UPDATE_MANUAL_APPROVAL_THRESHOLD:
            return <ReportActionItemBasicMessage message={getUpdatedManualApprovalThresholdMessage(translate, action)} />;

        case PCL.UPDATE_TIME_ENABLED:
            return <ReportActionItemBasicMessage message={getUpdatedTimeEnabledMessage(translate, action)} />;

        case PCL.UPDATE_TIME_RATE:
            return <ReportActionItemBasicMessage message={getUpdatedTimeRateMessage(translate, action)} />;

        case PCL.UPDATE_PROHIBITED_EXPENSES:
            return <ReportActionItemBasicMessage message={getUpdatedProhibitedExpensesMessage(translate, action)} />;

        case PCL.UPDATE_REIMBURSEMENT_CHOICE:
            return <ReportActionItemBasicMessage message={getUpdatedReimbursementChoiceMessage(translate, action)} />;

        case PCL.SET_AUTO_JOIN:
            return <ReportActionItemBasicMessage message={getSetAutoJoinMessage(translate, action)} />;

        case PCL.UPDATE_DEFAULT_TITLE:
            return <ReportActionItemBasicMessage message={getUpdatedDefaultTitleMessage(translate, action)} />;

        case PCL.UPDATE_AUTO_HARVESTING:
            return <ReportActionItemBasicMessage message={getUpdatedAutoHarvestingMessage(translate, action)} />;

        case PCL.INDIVIDUAL_BUDGET_NOTIFICATION:
            return (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getUpdatedIndividualBudgetNotificationMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );

        case PCL.SHARED_BUDGET_NOTIFICATION:
            return (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getUpdatedSharedBudgetNotificationMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );

        case PCL.CORPORATE_UPGRADE:
            return <ReportActionItemBasicMessage message={translate('workspaceActions.upgradedWorkspace')} />;

        case PCL.CORPORATE_FORCE_UPGRADE:
            return (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<muted-text>${translate('workspaceActions.forcedCorporateUpgrade')}</muted-text>`} />
                </ReportActionItemBasicMessage>
            );

        case PCL.TEAM_DOWNGRADE:
            return <ReportActionItemBasicMessage message={translate('workspaceActions.downgradedWorkspace')} />;

        default:
            break;
    }

    // Tag modification actions use a predicate check instead of direct actionName match
    if (isTagModificationAction(action.actionName)) {
        return <ReportActionItemBasicMessage message={getCleanedTagName(getWorkspaceTagUpdateMessage(translate, action))} />;
    }

    return null;
}

PolicyChangeLogRenderer.displayName = 'PolicyChangeLogRenderer';

export default PolicyChangeLogRenderer;
