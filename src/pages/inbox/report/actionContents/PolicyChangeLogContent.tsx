import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
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
} from '@libs/ReportActionsUtils';
import {getWorkspaceNameUpdatedMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PolicyChangeLogMessageResult = string | {html: string};

type ResolverFn = (translate: LocaleContextProps['translate'], action: OnyxTypes.ReportAction, policy: OnyxEntry<OnyxTypes.Policy>) => PolicyChangeLogMessageResult;

// Reusable resolvers for action types that share the same handler
const categoryResolver: ResolverFn = (translate, action, policy) => getWorkspaceCategoryUpdateMessage(translate, action, policy);
const taxResolver: ResolverFn = (translate, action) => getWorkspaceTaxUpdateMessage(translate, action);
const tagModificationResolver: ResolverFn = (translate, action) => getCleanedTagName(getWorkspaceTagUpdateMessage(translate, action));

const POLICY_CHANGE_LOG_RESOLVERS: Record<string, ResolverFn> = {
    // Simple string translations
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE]: (translate) => translate('workspaceActions.upgradedWorkspace'),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE]: (translate) => translate('workspaceActions.downgradedWorkspace'),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS]: (translate) => translate('workspaceActions.importTags'),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS]: (translate) => translate('workspaceActions.deletedAllTags'),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM]: (translate) => translate('report.actions.type.leftTheChat'),

    // HTML results
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE]: (translate) => ({html: `<muted-text>${translate('workspaceActions.forcedCorporateUpgrade')}</muted-text>`}),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION]: (translate, action) => ({
        html: `<comment><muted-text>${getUpdatedIndividualBudgetNotificationMessage(translate, action)}</muted-text></comment>`,
    }),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION]: (translate, action) => ({
        html: `<comment><muted-text>${getUpdatedSharedBudgetNotificationMessage(translate, action)}</muted-text></comment>`,
    }),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP]: (translate, action, policy) => ({
        html: `<comment><muted-text>${getUpdatedOwnershipMessage(translate, action, policy)}</muted-text></comment>`,
    }),

    // Standard message functions (translate, action)
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME]: (translate, action) => getWorkspaceNameUpdatedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY]: (translate, action) => getWorkspaceCurrencyUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY]: (translate, action) => getWorkspaceFrequencyUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES]: (translate, action) => getWorkspaceCategoriesUpdatedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME]: (translate, action) => getCustomTaxNameUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX]: (translate, action) => getCurrencyDefaultTaxUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX]: (translate, action) => getForeignCurrencyDefaultTaxUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT]: (translate, action) => getWorkspaceCustomUnitUpdatedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES]: (translate, action) => getWorkspaceCustomUnitRateImportedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE]: (translate, action) => getWorkspaceCustomUnitRateAddedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE]: (translate, action) => getWorkspaceCustomUnitRateUpdatedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE]: (translate, action) => getWorkspaceCustomUnitRateDeletedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE]: (translate, action) => getWorkspaceCustomUnitSubRateUpdatedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE]: (translate, action) => getWorkspaceCustomUnitSubRateDeletedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD]: (translate, action) => getWorkspaceReportFieldAddMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD]: (translate, action) => getWorkspaceReportFieldUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD]: (translate, action) => getWorkspaceReportFieldDeleteMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD]: (translate, action) => getWorkspaceUpdateFieldMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED]: (translate, action) => getWorkspaceFeatureEnabledMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED]: (translate, action) => getWorkspaceAttendeeTrackingUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER]: (translate, action) => getDefaultApproverUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO]: (translate, action) => getSubmitsToUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO]: (translate, action) => getForwardsToUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED]: (translate, action) => getAutoPayApprovedReportsEnabledMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT]: (translate, action) => getAutoReimbursementMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME]: (translate, action) => getInvoiceCompanyNameUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE]: (translate, action) => getInvoiceCompanyWebsiteUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER]: (translate, action) => getReimburserUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED]: (translate, action) => getWorkspaceReimbursementUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT]: (translate, action) => getUpdateACHAccountMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS]: (translate, action) => getCompanyAddressUpdateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT]: (translate, action) => getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT]: (translate, action) => getPolicyChangeLogMaxExpenseAmountMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE]: (translate, action) => getPolicyChangeLogMaxExpenseAgeMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE]: (translate, action) => getPolicyChangeLogDefaultBillableMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE]: (translate, action) => getPolicyChangeLogDefaultReimbursableMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED]: (translate, action) => getPolicyChangeLogDefaultTitleEnforcedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE]: (translate, action) => getPolicyChangeLogAddEmployeeMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE]: (translate, action) => getPolicyChangeLogUpdateEmployee(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE]: (translate, action) => getPolicyChangeLogDeleteMemberMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE]: (translate, action) => getAddedApprovalRuleMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE]: (translate, action) => getDeletedApprovalRuleMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE]: (translate, action) => getUpdatedApprovalRuleMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION]: (translate, action) => getAddedConnectionMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION]: (translate, action) => getRemovedConnectionMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED]: (translate, action) => getAddedCardFeedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED]: (translate, action) => getRemovedCardFeedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED]: (translate, action) => getRenamedCardFeedMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD]: (translate, action) => getAssignedCompanyCardMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD]: (translate, action) => getUnassignedCompanyCardMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY]: (translate, action) => getUpdatedCardFeedLiabilityMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD]: (translate, action) => getUpdatedCardFeedStatementPeriodMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE]: (translate, action) => getUpdatedAuditRateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD]: (translate, action) => getUpdatedManualApprovalThresholdMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED]: (translate, action) => getUpdatedTimeEnabledMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE]: (translate, action) => getUpdatedTimeRateMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES]: (translate, action) => getUpdatedProhibitedExpensesMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE]: (translate, action) => getUpdatedReimbursementChoiceMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN]: (translate, action) => getSetAutoJoinMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE]: (translate, action) => getUpdatedDefaultTitleMessage(translate, action),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING]: (translate, action) => getUpdatedAutoHarvestingMessage(translate, action),

    // Message functions that need policy (translate, action, policy)
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY]: categoryResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY]: categoryResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY]: categoryResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME]: categoryResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET]: (translate, action, policy) => getAddedBudgetMessage(translate, action, policy),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET]: (translate, action, policy) => getUpdatedBudgetMessage(translate, action, policy),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET]: (translate, action, policy) => getDeletedBudgetMessage(translate, action, policy),

    // Tax action types
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX]: taxResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX]: taxResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX]: taxResolver,

    // Tag-cleaned results
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME]: (translate, action) => getCleanedTagName(getTagListNameUpdatedMessage(translate, action)),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST]: (translate, action) => getCleanedTagName(getTagListUpdatedMessage(translate, action)),
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED]: (translate, action) => getCleanedTagName(getTagListUpdatedRequiredMessage(translate, action)),

    // Tag modification types
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG]: tagModificationResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED]: tagModificationResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME]: tagModificationResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG]: tagModificationResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS]: tagModificationResolver,
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG]: tagModificationResolver,
};

/**
 * The set of action type strings that PolicyChangeLogContent handles.
 */
const HANDLED_POLICY_CHANGE_LOG_ACTIONS = new Set<string>(Object.keys(POLICY_CHANGE_LOG_RESOLVERS));

function isHandledPolicyChangeLogAction(action: OnyxTypes.ReportAction): boolean {
    return HANDLED_POLICY_CHANGE_LOG_ACTIONS.has(action.actionName);
}

type PolicyChangeLogContentProps = {
    action: OnyxTypes.ReportAction;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function PolicyChangeLogContent({action, policy}: PolicyChangeLogContentProps) {
    const {translate} = useLocalize();

    const resolver = POLICY_CHANGE_LOG_RESOLVERS[action.actionName];
    if (!resolver) {
        return null;
    }

    const message = resolver(translate, action, policy);

    if (typeof message === 'object') {
        return (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={message.html} />
            </ReportActionItemBasicMessage>
        );
    }

    return <ReportActionItemBasicMessage message={message} />;
}

PolicyChangeLogContent.displayName = 'PolicyChangeLogContent';

export {isHandledPolicyChangeLogAction, HANDLED_POLICY_CHANGE_LOG_ACTIONS};
export default PolicyChangeLogContent;
