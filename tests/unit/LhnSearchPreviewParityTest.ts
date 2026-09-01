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
import {convertToDisplayString, formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
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

function makeAction(actionName: ReportAction['actionName'], overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '1',
        actionName,
        created: '2024-01-01 00:00:00.000',
        actorAccountID: 1,
        person: [{type: 'TEXT', style: 'strong', text: 'Alice Aluminum'}],
        message: [{type: 'COMMENT', html: '<em>Fixture message html</em>', text: 'Fixture message text', isDeletedParentAction: false, deleted: ''}],
        ...overrides,
    } as ReportAction;
}

type ParityCase = {
    report?: Report;
    lastAction?: ReportAction;
    extraReports?: Report[];
    policy?: OnyxEntry<Policy>;
    /** LHN-only input (OptionRowLHNData resolves it per row); Search has no per-row source for it. */
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    cardList?: OnyxEntry<CardList>;
    isReportArchived?: boolean;
    isTrackIntentUser?: boolean;
};

/**
 * Seeds Onyx with the case state, computes the preview text through both surfaces
 * (LHN: getOptionData with deps assembled like OptionRowLHNData; Search: the real
 * createFilteredOptionList → getSearchOptions pipeline) and returns both strings.
 */
async function computeBothSurfaces({
    report = makeReport(),
    lastAction,
    extraReports = [],
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

    await act(async () => {
        await Promise.all(Object.values(reportsById).map((seeded) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${seeded.reportID}`, seeded)));
        if (lastAction) {
            const reportActions: ReportActions = {[lastAction.reportActionID]: lastAction};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
        }
    });
    await waitForBatchedUpdatesWithAct();

    const sortedData = await getOnyxValue(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
    const reportAttributesValue = await getOnyxValue(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const reportAttributesDerived = reportAttributesValue?.reports;

    // ---- LHN surface: deps assembled the way OptionRowLHNData does ----
    const canWrite = canUserPerformWriteAction(report, isReportArchived);
    const oneTransactionThreadReportID = sortedData?.transactionThreadIDs?.[report.reportID];
    const actionsCollection: OnyxCollection<ReportActions> = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: lastAction ? {[lastAction.reportActionID]: lastAction} : undefined,
    };
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
    });

    // ---- Search surface: the real pipeline ----
    const reportsCollection: OnyxCollection<Report> = {};
    for (const [id, seeded] of Object.entries(reportsById)) {
        reportsCollection[`${ONYXKEYS.COLLECTION.REPORT}${id}`] = seeded;
    }
    const privateIsArchivedMap: PrivateIsArchivedMap = isReportArchived ? {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: true} : {};
    const policiesCollection: OnyxCollection<Policy> = policy ? {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy} : {};

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
            conciergeReportID: CONCIERGE_REPORT_ID,
            isSearching: true,
        },
        undefined,
        undefined,
        isTrackIntentUser,
        sortedData?.sortedActions,
    );

    const {options: searchResults} = getSearchOptions({
        dateFnsLocale: undefined,
        options: optionList,
        draftComments: {},
        loginList: {},
        betas: [CONST.BETAS.ALL],
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
        convertToDisplayString,
        conciergeReportID: CONCIERGE_REPORT_ID,
        isTrackIntentUser,
        translate: translateLocal,
    });

    const searchOption = searchResults.recentReports.find((option) => option.reportID === report.reportID);
    return {lhnText: lhnOption?.alternateText, searchText: searchOption?.alternateText, searchOptionFound: !!searchOption};
}

async function expectParity(parityCase: ParityCase) {
    const {lhnText, searchText, searchOptionFound} = await computeBothSurfaces(parityCase);
    expect(searchOptionFound).toBe(true);
    // Guards the assertion below against vacuous undefined === undefined parity.
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

        it('should diverge for empty invoice room where LHN uses invoiceReceiverPolicy for the welcome payer but Search cannot (documented gap)', async () => {
            // TODO(parity): invoiceReceiverPolicy is not threaded on the Search path (no per-row source),
            // so the invoice-room welcome message payer name is empty in Search while LHN shows the
            // receiver policy name. Remove this divergence assertion once a per-row source exists.
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
            expect(searchText).not.toBe(lhnText);
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
