/* eslint-disable @typescript-eslint/naming-convention */
import {act} from '@testing-library/react-native';

import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';

import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {clearFilteredOptionListCache, createFilteredOptionList, getSearchOptions} from '@libs/OptionsListUtils';
import {getLastVisibleActionIncludingTransactionThread, getOriginalMessage, isInviteOrRemovedAction} from '@libs/ReportActionsUtils';
import {getExpensifyCardFromReportAction} from '@libs/ReportAlternateTextUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, PersonalDetailsList, Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import {convertToDisplayString, convertToDisplayStringWithoutCurrency, formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_LOGIN = 'test@example.com';
const CURRENT_USER_ACCOUNT_ID = 5;
const CONCIERGE_REPORT_ID = '999';

const PERSONAL_DETAILS: PersonalDetailsList = {
    1: {accountID: 1, login: 'alice@test.com', displayName: 'Alice Aluminum', firstName: 'Alice'},
    2: {accountID: 2, login: 'bob@test.com', displayName: 'Bob Boron', firstName: 'Bob'},
    3: {accountID: 3, login: 'carol@test.com', displayName: 'Carol Carbon', firstName: 'Carol'},
    [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Current User'},
};

function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: '100',
        type: CONST.REPORT.TYPE.CHAT,
        reportName: '#test-room',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID: '6',
        lastVisibleActionCreated: '2024-01-01 00:00:00.000',
        lastReadTime: '2023-12-31 00:00:00.000',
        lastMessageText: 'Fixture last message',
        lastMessageHtml: 'Fixture last message',
        participants: {
            1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
        ...overrides,
    };
}

// Minimal `originalMessage` payloads for the chain branches that build their text from one.
// Without these the branch runs, produces an empty string and the snapshot pins the generic
// `lastMessageText` fallback instead of the branch output.
const ORIGINAL_MESSAGE_BY_ACTION: Partial<Record<ReportAction['actionName'], Record<string, unknown>>> = {
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED]: {label: 'QuickBooks Online', errorMessage: 'Invalid credentials', recurrenceCount: 1},
    [CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN]: {feedName: 'Visa', policyID: '6'},
    [CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE]: {maskedAccountNumber: '1234'},
    [CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED]: {maskedBankAccountNumber: '1234', policyID: '6'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE]: {email: 'bob@test.com', role: 'member', didJoinPolicy: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE]: {email: 'bob@test.com', role: 'member'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OVER_LIMIT_FORWARDS_TO]: {
        member: {email: 'bob@test.com', name: 'Bob Boron', accountID: 2},
        overLimitForwardsTo: {email: 'carol@test.com', name: 'Carol Carbon', accountID: 3},
        previousOverLimitForwardsTo: {email: 'alice@test.com', name: 'Alice Aluminum', accountID: 1},
        limit: 50000,
        previousLimit: 25000,
        currency: 'USD',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME]: {oldName: 'Old workspace', newName: 'New workspace'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION]: {oldDescription: 'Old description', newDescription: 'New description'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY]: {oldCurrency: 'USD', newCurrency: 'EUR'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY]: {
        oldFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
        newFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY]: {categoryName: 'Travel'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY]: {categoryName: 'Travel'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY]: {categoryName: 'Travel', updatedField: 'enabled', oldValue: false, newValue: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES]: {count: 3},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX]: {taxName: 'VAT'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX]: {taxName: 'VAT'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX]: {taxName: 'VAT', updatedField: 'rate', oldValue: '10%', newValue: '20%'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME]: {oldName: 'Tax', newName: 'VAT'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX]: {oldName: 'Tax', newName: 'VAT'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX]: {oldName: 'Tax', newName: 'VAT'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST]: {tagListName: 'Region'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED]: {tagListsName: 'Region', isRequired: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME]: {oldName: 'Region', newName: 'Area'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG]: {tagListName: 'Region', tagName: 'North'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG]: {tagListName: 'Region', tagName: 'North'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG]: {tagListName: 'Region', tagName: 'North', updatedField: 'name', oldValue: 'North', newValue: 'South'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT]: {customUnitName: 'Distance', updatedField: 'defaultCategory', oldValue: 'Car', newValue: 'Travel'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES]: {customUnitName: 'Distance'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE]: {
        customUnitName: 'Distance',
        rateName: 'Default Rate',
        rate: 70,
        currency: 'USD',
        unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE]: {
        customUnitName: 'Distance',
        customUnitRateName: 'Default Rate',
        updatedField: CONST.CUSTOM_UNITS.RATE_CHANGELOG_UPDATED_FIELD.RATE,
        oldRate: 60,
        newRate: 70,
        currency: 'USD',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE]: {customUnitName: 'Distance', rateName: 'Default Rate'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE]: {
        customUnitName: 'Distance',
        customUnitRateName: 'Default Rate',
        customUnitSubRateName: 'Trailer',
        updatedField: 'rate',
        oldValue: '0.60',
        newValue: '0.70',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE]: {customUnitName: 'Distance', customUnitRateName: 'Default Rate', removedSubRateName: 'Trailer'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD]: {fieldName: 'Department', fieldType: 'text', defaultValue: 'Sales'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD]: {updateType: 'addedOption', fieldName: 'Department', optionName: 'Sales'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD]: {fieldName: 'Department', fieldType: 'text'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD]: {updatedField: CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE, oldValue: 'OPTIONAL', newValue: 'BASIC'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED]: {featureName: 'categories', enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE]: {preference: CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT]: {currency: 'USD', oldLimit: 10000, newLimit: 20000},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE]: {categoryName: 'Travel', oldTaxName: 'VAT', oldTaxPercentage: '10%', newTaxName: 'GST', newTaxPercentage: '20%'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY]: {mccGroupName: CONST.MCC_GROUPS.AIRLINES, oldCategory: 'Travel', newCategory: 'Flights'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER]: {approver: {email: 'carol@test.com'}, previousApprover: {email: 'bob@test.com'}},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO]: {
        members: [{email: 'bob@test.com', name: 'Bob Boron', accountID: 2}],
        approver: {email: 'carol@test.com', name: 'Carol Carbon', accountID: 3},
        isDefaultApprover: false,
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO]: {
        approvers: [{email: 'bob@test.com', name: 'Bob Boron', accountID: 2}],
        forwardsTo: {email: 'carol@test.com', name: 'Carol Carbon', accountID: 3},
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVAL_LIMIT]: {member: {email: 'bob@test.com'}, limit: 50000, previousLimit: 25000, currency: 'USD'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME]: {oldValue: 'Old Co', newValue: 'New Co'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE]: {oldValue: 'https://old.example.com', newValue: 'https://new.example.com'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER]: {reimburser: {email: 'carol@test.com'}, previousReimburser: {email: 'bob@test.com'}},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT]: {bankAccountName: 'Checking', maskedBankAccountNumber: '1234'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS]: {
        oldAddress: {addressStreet: '1 Old St', city: 'Portland', state: 'OR', zipCode: '97205', country: 'US'},
        newAddress: {addressStreet: '2 New St', city: 'Portland', state: 'OR', zipCode: '97205', country: 'US'},
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT]: {currency: 'USD', oldMaxExpenseAmountNoReceipt: 2500, newMaxExpenseAmountNoReceipt: 5000},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT]: {
        currency: 'USD',
        oldMaxExpenseAmountNoItemizedReceipt: 2500,
        newMaxExpenseAmountNoItemizedReceipt: 5000,
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT]: {currency: 'USD', oldMaxExpenseAmount: 10000, newMaxExpenseAmount: 20000},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE]: {oldMaxExpenseAge: 30, newMaxExpenseAge: 60},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE]: {oldDefaultBillable: 'false', newDefaultBillable: 'true'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE]: {oldDefaultReimbursable: 'false', newDefaultReimbursable: 'true'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED]: {value: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE]: {oldDefaultTitle: 'Old title', newDefaultTitle: 'New title'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED]: {feedName: 'Visa'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED]: {feedName: 'Visa'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED]: {oldName: 'Visa', newName: 'Visa Corporate'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD]: {email: 'bob@test.com', feedName: 'Visa', cardLastFour: '1234'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD]: {email: 'bob@test.com', feedName: 'Visa', cardLastFour: '1234'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY]: {feedName: 'Visa', liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD]: {feedName: 'Visa', statementPeriodEndDay: 15, previousStatementPeriodEndDay: 1},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE]: {oldAuditRate: 0.1, newAuditRate: 0.5},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE]: {name: 'Travel', field: 'category', approverEmail: 'bob@test.com', approverName: 'Bob Boron', approverAccountID: 2},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE]: {name: 'Travel', field: 'category', approverEmail: 'bob@test.com', approverName: 'Bob Boron', approverAccountID: 2},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE]: {
        name: 'Travel',
        field: 'category',
        oldApproverEmail: 'bob@test.com',
        oldApproverName: 'Bob Boron',
        newApproverEmail: 'carol@test.com',
        newApproverName: 'Carol Carbon',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE]: {
        action: CONST.SPEND_RULES.ACTION.ALLOW,
        oldMerchants: ['Amazon'],
        merchants: ['Amazon', 'Uber'],
        currency: 'USD',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD]: {currency: 'USD', oldLimit: 10000, newLimit: 20000},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET]: {entityType: 'category', categoryName: 'Travel', newValue: {frequency: 'monthly', shared: 100000, individual: 50000}},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET]: {
        entityType: 'category',
        categoryName: 'Travel',
        oldValue: {frequency: 'monthly', shared: 100000, individual: 50000, notificationThreshold: 80},
        newValue: {frequency: 'yearly', shared: 200000, individual: 100000, notificationThreshold: 90},
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET]: {entityType: 'category', categoryName: 'Travel', oldValue: {frequency: 'monthly', shared: 100000, individual: 50000}},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE]: {currency: 'USD', oldRate: 50, newRate: 60},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES]: {
        oldProhibitedExpenses: {[CONST.POLICY.PROHIBITED_EXPENSES.ALCOHOL]: false},
        newProhibitedExpenses: {[CONST.POLICY.PROHIBITED_EXPENSES.ALCOHOL]: true},
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE]: {
        oldChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        newChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN]: {enabled: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING]: {value: true},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP]: {oldOwnerEmail: 'bob@test.com', oldOwnerName: 'Bob Boron'},
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION]: {
        budgetAmount: 100000,
        budgetFrequency: 'monthly',
        budgetName: 'Travel',
        budgetTypeForNotificationMessage: 'category',
        thresholdPercentage: 80,
        totalSpend: 80000,
        unsubmittedSpend: 10000,
        awaitingApprovalSpend: 20000,
        approvedReimbursedClosedSpend: 50000,
        userEmail: 'bob@test.com',
    },
    [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION]: {
        budgetAmount: 100000,
        budgetFrequency: 'monthly',
        budgetName: 'Travel',
        budgetTypeForNotificationMessage: 'category',
        thresholdPercentage: 80,
        totalSpend: 80000,
        unsubmittedSpend: 10000,
        awaitingApprovalSpend: 20000,
        approvedReimbursedClosedSpend: 50000,
    },
};
function makeAction(actionName: ReportAction['actionName'], overrides: Partial<ReportAction> = {}): ReportAction {
    const originalMessage = ORIGINAL_MESSAGE_BY_ACTION[actionName];
    return {
        reportActionID: '1',
        actionName,
        created: '2024-01-01 00:00:00.000',
        actorAccountID: 1,
        person: [{type: 'TEXT', style: 'strong', text: 'Alice Aluminum'}],
        message: [{type: 'COMMENT', html: '<em>Fixture message html</em>', text: 'Fixture message text', isDeletedParentAction: false, deleted: ''}],
        ...(originalMessage ? {originalMessage} : {}),
        ...overrides,
    } as ReportAction;
}

type ParityCase = {
    report?: Report;
    lastAction?: ReportAction;
    mainReportActions?: ReportAction[];
    extraReports?: Report[];
    extraReportActions?: Record<string, ReportAction[]>;
    lateReportActions?: Record<string, ReportAction[]>;
    policy?: OnyxEntry<Policy>;
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    cardList?: OnyxEntry<CardList>;
    isReportArchived?: boolean;
    isTrackIntentUser?: boolean;
};

function toReportActions(actions: ReportAction[]): ReportActions {
    return Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
}

async function computeBothSurfaces({
    report = makeReport(),
    lastAction,
    mainReportActions,
    extraReports = [],
    extraReportActions = {},
    lateReportActions = {},
    policy,
    invoiceReceiverPolicy,
    cardList,
    isReportArchived = false,
    isTrackIntentUser = false,
}: ParityCase) {
    const reportsById: Record<string, Report> = {[report.reportID]: report};
    for (const extra of extraReports) {
        reportsById[extra.reportID] = extra;
    }

    const seededMainActions = mainReportActions ?? (lastAction ? [lastAction] : undefined);

    await act(async () => {
        await Promise.all(Object.values(reportsById).map((seeded) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${seeded.reportID}`, seeded)));
        if (seededMainActions) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, toReportActions(seededMainActions));
        }
        await Promise.all(Object.entries(extraReportActions).map(([reportID, actions]) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, toReportActions(actions))));
    });
    await waitForBatchedUpdatesWithAct();

    if (Object.keys(lateReportActions).length > 0) {
        await act(async () => {
            await Promise.all(Object.entries(lateReportActions).map(([reportID, actions]) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, toReportActions(actions))));
        });
        await waitForBatchedUpdatesWithAct();
    }

    const sortedData = await getOnyxValue(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
    const reportAttributesValue = await getOnyxValue(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const reportAttributesDerived = reportAttributesValue?.reports;

    const canWrite = canUserPerformWriteAction(report, isReportArchived);
    const oneTransactionThreadReportID = sortedData?.transactionThreadIDs?.[report.reportID];
    const actionsCollection: OnyxCollection<ReportActions> = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: seededMainActions ? toReportActions(seededMainActions) : undefined,
    };
    for (const [reportID, actions] of Object.entries(extraReportActions)) {
        actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = toReportActions(actions);
    }
    for (const [reportID, actions] of Object.entries(lateReportActions)) {
        actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = {...actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`], ...toReportActions(actions)};
    }
    const lhnLastAction = getLastVisibleActionIncludingTransactionThread(report.reportID, canWrite, actionsCollection, undefined, oneTransactionThreadReportID);
    let lastActionReport: OnyxEntry<Report>;
    if (isInviteOrRemovedAction(lhnLastAction)) {
        const originalMessage = getOriginalMessage(lhnLastAction);
        lastActionReport = originalMessage?.reportID ? reportsById[String(originalMessage.reportID)] : undefined;
    }
    const movedFromReportID = getMovedReportID(lhnLastAction, CONST.REPORT.MOVE_TYPE.FROM);
    const movedToReportID = getMovedReportID(lhnLastAction, CONST.REPORT.MOVE_TYPE.TO);
    const card: Card | undefined = getExpensifyCardFromReportAction({reportAction: lhnLastAction, policy, cardList, workspaceCardList: undefined});

    const lhnOption = SidebarUtils.getOptionData({
        report,
        reportAttributes: reportAttributesDerived?.[report.reportID],
        oneTransactionThreadReport: oneTransactionThreadReportID ? reportsById[oneTransactionThreadReportID] : undefined,
        reportNameValuePairs: isReportArchived ? {private_isArchived: '2024-01-02 00:00:00.000'} : {},
        personalDetails: PERSONAL_DETAILS,
        policy,
        parentReportAction: undefined,
        conciergeReportID: CONCIERGE_REPORT_ID,
        invoiceReceiverPolicy,
        lastMessageTextFromReport: undefined,
        card,
        lastAction: lhnLastAction,
        translate: translateLocal,
        dateFnsLocale: undefined,
        convertToDisplayString,
        convertToDisplayStringWithoutCurrency,
        localeCompare,
        isReportArchived,
        lastActionReport,
        movedFromReport: movedFromReportID ? reportsById[movedFromReportID] : undefined,
        movedToReport: movedToReportID ? reportsById[movedToReportID] : undefined,
        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        visibleReportActionsData: undefined,
        reportAttributesDerived,
        policyTags: undefined,
        currentUserLogin: CURRENT_USER_LOGIN,
        isTrackIntentUser,
        formatPhoneNumber,
        rules: undefined,
    });

    const reportsCollection: OnyxCollection<Report> = {};
    for (const [id, seeded] of Object.entries(reportsById)) {
        reportsCollection[`${ONYXKEYS.COLLECTION.REPORT}${id}`] = seeded;
    }
    const privateIsArchivedMap: PrivateIsArchivedMap = isReportArchived ? {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: true} : {};
    const policiesCollection: OnyxCollection<Policy> = policy ? {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy} : {};
    if (invoiceReceiverPolicy) {
        policiesCollection[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicy.id}`] = invoiceReceiverPolicy;
    }

    const optionList = createFilteredOptionList(
        PERSONAL_DETAILS,
        reportsCollection,
        reportAttributesDerived,
        privateIsArchivedMap,
        policiesCollection,
        {
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            currentUserLogin: CURRENT_USER_LOGIN,
            transactionThreadIDs: sortedData?.transactionThreadIDs,
            lastActions: sortedData?.lastActions,
            dateFnsLocale: undefined,
            convertToDisplayString,
            conciergeReportID: CONCIERGE_REPORT_ID,
            isSearching: true,
        },
        undefined,
        undefined,
        undefined,
        isTrackIntentUser,
        sortedData?.sortedActions,
    );

    const {options: searchResults} = getSearchOptions({
        dateFnsLocale: undefined,
        convertToDisplayString,
        options: optionList,
        draftComments: {},
        loginList: {},
        isDefaultRoomsBetaEnabled: true,
        policyCollection: policiesCollection,
        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        currentUserEmail: CURRENT_USER_LOGIN,
        currentUserLogin: CURRENT_USER_LOGIN,
        personalDetails: PERSONAL_DETAILS,
        reportAttributesDerived,
        sortedActions: sortedData?.sortedActions,
        transactionThreadIDs: sortedData?.transactionThreadIDs,
        lastActions: sortedData?.lastActions,
        cardList,
        localeCompare,
        formatPhoneNumber,
        conciergeReportID: CONCIERGE_REPORT_ID,
        isTrackIntentUser,
        translate: translateLocal,
        rules: undefined,
    });

    const searchOption = searchResults.recentReports.find((option) => option.reportID === report.reportID);
    return {lhnText: lhnOption?.alternateText, searchText: searchOption?.alternateText, searchOptionFound: !!searchOption};
}

async function expectParity(parityCase: ParityCase) {
    const {lhnText, searchText, searchOptionFound} = await computeBothSurfaces(parityCase);
    expect(searchOptionFound).toBe(true);
    expect(lhnText).toBeTruthy();
    expect(searchText).toBe(lhnText);
}

const SIMPLE_CHAIN_ACTIONS: Array<ReportAction['actionName']> = [
    CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM,
    CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE,
    CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED,
    CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN,
    CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORIES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_TAGS,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_ALL_TAGS,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_REQUIRED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.IMPORT_CUSTOM_UNIT_RATES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_SUB_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_SUB_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REIMBURSEMENT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY,
    CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION,
    CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE,
    CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_BUDGET,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_BUDGET,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_BUDGET,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_ENABLED,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TIME_RATE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_PROHIBITED_EXPENSES,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_CHOICE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_AUTO_JOIN,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INDIVIDUAL_BUDGET_NOTIFICATION,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SHARED_BUDGET_NOTIFICATION,
    CONST.REPORT.ACTIONS.TYPE.RETRACTED,
    CONST.REPORT.ACTIONS.TYPE.REOPENED,
    CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
    CONST.REPORT.ACTIONS.TYPE.REROUTE,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_OWNERSHIP,
    CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED,
    CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL,
    CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT,
    CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
];

describe('LHN vs Search preview parity', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        clearFilteredOptionListCache();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('special-action chain branches (policy room)', () => {
        it.each(SIMPLE_CHAIN_ACTIONS)('should match for %s', async (actionName) => {
            await expectParity({lastAction: makeAction(actionName)});
        });
    });

    describe('branches with bespoke payloads', () => {
        it('should match for RENAMED with old/new name', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {originalMessage: {oldName: 'Old room name', newName: 'New room name'}}),
            });
        });

        it('should match for ROOM invite with targetAccountIDs and room name from originalMessage', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {targetAccountIDs: [2, 3], roomName: 'general'}}),
            });
        });

        it('should match for POLICY remove with single target', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM, {originalMessage: {targetAccountIDs: [2]}}),
            });
        });

        it('should match for invite with room name resolved from lastActionReport', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {targetAccountIDs: [2], reportID: 200}}),
                extraReports: [makeReport({reportID: '200', reportName: '#target-room'})],
            });
        });

        it('should match for ACTIONABLE_CARD_FRAUD_ALERT with resolution', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT, {
                    originalMessage: {resolution: CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED, cardID: 11, maskedCardNumber: '4444', triggerAmount: 1000, triggerMerchant: 'ACME'},
                }),
            });
        });

        it('should match for CARD_ISSUED without card', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, {originalMessage: {assigneeAccountID: 2, cardID: 11}}),
            });
        });

        it('should match for CARD_ISSUED with card', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, {originalMessage: {assigneeAccountID: 2, cardID: 11}}),
                cardList: {
                    11: {
                        cardID: 11,
                        state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
                        bank: CONST.EXPENSIFY_CARD.BANK,
                        domainName: 'test.com',
                        lastUpdated: '2024-01-01',
                        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
                        lastFourPAN: '1234',
                    },
                },
            });
        });

        it('should match when ROOM invite without targetAccountIDs falls back to mention-user count in lastMessageHtml', async () => {
            await expectParity({
                report: makeReport({lastMessageHtml: '<mention-user></mention-user><mention-user></mention-user>'}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {}}),
            });
        });

        it('should match for ADD_INTEGRATION with connection name', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION, {originalMessage: {connectionName: CONST.POLICY.CONNECTIONS.NAME.QBO}}),
            });
        });

        it('should match for DELETE_INTEGRATION with connection name', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION, {originalMessage: {connectionName: CONST.POLICY.CONNECTIONS.NAME.XERO}}),
            });
        });

        it('should match for UPDATE_EMPLOYEE with role change', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE, {
                    originalMessage: {email: 'bob@test.com', field: 'role', oldValue: CONST.POLICY.ROLE.USER, newValue: CONST.POLICY.ROLE.ADMIN},
                }),
            });
        });

        it('should match for REASSIGN_APPROVER with new approver', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER, {originalMessage: {newApproverID: 2}}),
            });
        });

        it('should match for TRAVEL_UPDATE booking ticketed', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE, {
                    originalMessage: {
                        type: CONST.RESERVATION_TYPE.FLIGHT,
                        operation: CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_TICKETED,
                        start: {date: '2024-03-01 10:00:00', shortName: 'KRK'},
                        end: {date: '2024-03-01 14:00:00', shortName: 'SFO'},
                        route: {airlineCode: 'LO 3925', number: '3925'},
                        confirmations: [{name: 'PNR', value: 'ABC123'}],
                    },
                }),
            });
        });

        it('should match for MOVED_TRANSACTION with derived report name', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, {originalMessage: {toReportID: '300', fromReportID: '100'}}),
                extraReports: [makeReport({reportID: '300', reportName: 'Target Expense Report', chatType: undefined, type: CONST.REPORT.TYPE.EXPENSE})],
            });
        });

        it('should match when generic ADD_COMMENT in room gets actor prefix', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
            });
        });

        it('should match for generic ADD_COMMENT from current user in room', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: CURRENT_USER_ACCOUNT_ID, person: [{type: 'TEXT', style: 'strong', text: 'Current User'}]}),
            });
        });

        it('should match when generic branch resolves actor from person[0].text when personalDetails miss the actor', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: 42, person: [{type: 'TEXT', style: 'strong', text: 'Mystery Person'}]}),
            });
        });

        it('should match for REPORT_PREVIEW on policy expense chat', async () => {
            await expectParity({
                report: makeReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, reportName: 'Workspace chat', lastMessageText: 'owes $1.00', lastMessageHtml: 'owes $1.00'}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW),
            });
        });
    });

    describe('report-type and fallback variants', () => {
        it('should match when empty room falls back to welcome message', async () => {
            await expectParity({report: makeReport({lastMessageText: '', lastMessageHtml: ''})});
        });

        it('should match when empty policy expense chat falls back to welcome message', async () => {
            await expectParity({
                report: makeReport({
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    reportName: 'Workspace chat',
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    lastMessageText: '',
                    lastMessageHtml: '',
                }),
            });
        });

        it('should match when empty DM falls back to welcome message', async () => {
            await expectParity({report: makeReport({chatType: undefined, reportName: '', lastMessageText: '', lastMessageHtml: ''})});
        });

        it('should match for empty self-DM with isTrackIntentUser true', async () => {
            await expectParity({
                report: makeReport({
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                    reportName: '',
                    lastMessageText: '',
                    lastMessageHtml: '',
                    participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                }),
                isTrackIntentUser: true,
            });
        });

        it('should match for empty self-DM with isTrackIntentUser false', async () => {
            await expectParity({
                report: makeReport({
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                    reportName: '',
                    lastMessageText: '',
                    lastMessageHtml: '',
                    participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                }),
            });
        });

        it('should match when DM with last message shows actor prefix', async () => {
            await expectParity({
                report: makeReport({chatType: undefined, reportName: '', lastActorAccountID: 1}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
            });
        });

        it('should match when DM last message from current user has no actor prefix', async () => {
            await expectParity({
                report: makeReport({chatType: undefined, reportName: '', lastActorAccountID: CURRENT_USER_ACCOUNT_ID}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: CURRENT_USER_ACCOUNT_ID, person: [{type: 'TEXT', style: 'strong', text: 'Current User'}]}),
            });
        });

        it('should match for group chat with last comment', async () => {
            await expectParity({
                report: makeReport({
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: 'Alice, Bob, Carol',
                    participants: {
                        1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                }),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
            });
        });

        it('should match when archived room skips the special-action chain', async () => {
            await expectParity({
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {originalMessage: {oldName: 'Old', newName: 'New'}}),
                isReportArchived: true,
            });
        });

        it('should match when multiline last message collapses line breaks', async () => {
            await expectParity({
                report: makeReport({lastMessageText: 'line one\nline two\nline three', lastMessageHtml: 'line one<br />line two<br />line three'}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {
                    message: [{type: 'COMMENT', html: 'line one<br />line two<br />line three', text: 'line one\nline two\nline three', isDeletedParentAction: false, deleted: ''}],
                }),
            });
        });

        it('should match for empty invoice room where the welcome payer comes from invoiceReceiverPolicy', async () => {
            const {lhnText, searchText, searchOptionFound} = await computeBothSurfaces({
                report: makeReport({
                    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                    reportName: 'Invoice room',
                    lastMessageText: '',
                    lastMessageHtml: '',
                    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'P1'},
                }),
                invoiceReceiverPolicy: {...createRandomPolicy(1), id: 'P1', name: 'Biz Co'},
            });
            expect(searchOptionFound).toBe(true);
            expect(lhnText).toContain('Biz Co');
            expect(searchText).toBe(lhnText);
        });

        it('should match for a one-transaction expense report whose newest action is the IOU create action', async () => {
            const createdAction = makeAction(CONST.REPORT.ACTIONS.TYPE.CREATED, {reportActionID: '1', created: '2024-01-01 00:00:00.000'});
            const iouAction = makeAction(CONST.REPORT.ACTIONS.TYPE.IOU, {
                reportActionID: '2',
                created: '2024-01-02 00:00:00.000',
                childReportID: '400',
                originalMessage: {
                    IOUReportID: '100',
                    IOUTransactionID: 't1',
                    amount: 1234,
                    currency: 'USD',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            });
            const threadCreatedAction = makeAction(CONST.REPORT.ACTIONS.TYPE.CREATED, {reportActionID: '3', created: '2024-01-02 00:00:01.000'});
            const threadCommentAction = makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {
                reportActionID: '4',
                created: '2024-01-03 00:00:00.000',
                message: [{type: 'COMMENT', html: 'Thread follow-up', text: 'Thread follow-up', isDeletedParentAction: false, deleted: ''}],
            });

            await expectParity({
                report: makeReport({
                    type: CONST.REPORT.TYPE.EXPENSE,
                    chatType: undefined,
                    reportName: 'Expense Report',
                    ownerAccountID: 1,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    lastVisibleActionCreated: '2024-01-02 00:00:00.000',
                }),
                mainReportActions: [createdAction, iouAction],
                extraReports: [
                    makeReport({
                        reportID: '400',
                        chatType: undefined,
                        reportName: 'Transaction thread',
                        parentReportID: '100',
                        parentReportActionID: '2',
                    }),
                ],
                extraReportActions: {'400': [threadCreatedAction]},
                lateReportActions: {'400': [threadCommentAction]},
            });
        });

        it('should match when SMS domain is stripped from last message', async () => {
            await expectParity({
                report: makeReport({lastMessageText: 'ping +15551234567@expensify.sms please', lastMessageHtml: 'ping +15551234567@expensify.sms please'}),
                lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {
                    message: [{type: 'COMMENT', html: 'ping +15551234567@expensify.sms please', text: 'ping +15551234567@expensify.sms please', isDeletedParentAction: false, deleted: ''}],
                }),
            });
        });
    });
});
