/* eslint-disable @typescript-eslint/naming-convention */
import {act} from '@testing-library/react-native';

import SidebarUtils from '@libs/SidebarUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {convertToDisplayString, formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_LOGIN = 'test@example.com';
const CURRENT_USER_ACCOUNT_ID = 5;

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

type Case = {
    report?: Report;
    lastAction?: ReportAction;
    lastMessageTextFromReport?: string;
    card?: Card;
    policy?: OnyxEntry<Policy>;
    isReportArchived?: boolean;
    isTrackIntentUser?: boolean;
    conciergeReportID?: string;
    lastActionReport?: OnyxEntry<Report>;
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];
    currentUserAccountID?: number;
};

function getAlternateText({
    report = makeReport(),
    lastAction,
    lastMessageTextFromReport = 'Fixture last message',
    card,
    policy,
    isReportArchived = false,
    isTrackIntentUser = false,
    conciergeReportID = '999',
    lastActionReport,
    reportAttributesDerived,
    currentUserAccountID = CURRENT_USER_ACCOUNT_ID,
}: Case): string | undefined {
    const result = SidebarUtils.getOptionData({
        report,
        reportAttributes: undefined,
        oneTransactionThreadReport: undefined,
        reportNameValuePairs: {},
        personalDetails: PERSONAL_DETAILS,
        policy,
        parentReportAction: undefined,
        conciergeReportID,
        invoiceReceiverPolicy: undefined,
        lastMessageTextFromReport,
        card,
        lastAction,
        translate: translateLocal,
        dateFnsLocale: undefined,
        convertToDisplayString,
        localeCompare,
        isReportArchived,
        lastActionReport,
        movedFromReport: undefined,
        movedToReport: undefined,
        currentUserAccountID,
        visibleReportActionsData: undefined,
        reportAttributesDerived,
        policyTags: undefined,
        currentUserLogin: CURRENT_USER_LOGIN,
        isTrackIntentUser,
        formatPhoneNumber,
    });
    return result?.alternateText;
}

// Every special-action branch in the alternateText chain that needs no bespoke payload:
// a policy room report + an action with only `actionName` exercises the branch.
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
];

describe('getOptionData alternateText parity snapshots', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('special-action chain branches (policy room)', () => {
        it.each(SIMPLE_CHAIN_ACTIONS)('%s', (actionName) => {
            expect(getAlternateText({lastAction: makeAction(actionName)})).toMatchSnapshot();
        });
    });

    describe('branches with bespoke payloads', () => {
        it('RENAMED with old/new name', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {originalMessage: {oldName: 'Old room name', newName: 'New room name'}}),
                }),
            ).toMatchSnapshot();
        });

        it('ROOM invite with targetAccountIDs and room name from originalMessage', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {targetAccountIDs: [2, 3], roomName: 'general'}}),
                }),
            ).toMatchSnapshot();
        });

        it('POLICY remove with single target', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM, {originalMessage: {targetAccountIDs: [2]}}),
                }),
            ).toMatchSnapshot();
        });

        it('ROOM invite without targetAccountIDs falls back to mention-user count in lastMessageHtml', () => {
            expect(
                getAlternateText({
                    report: makeReport({lastMessageHtml: '<mention-user></mention-user><mention-user></mention-user>'}),
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {}}),
                }),
            ).toMatchSnapshot();
        });

        it('invite with room name resolved from lastActionReport', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, {originalMessage: {targetAccountIDs: [2]}}),
                    lastActionReport: makeReport({reportID: '200', reportName: '#target-room'}),
                }),
            ).toMatchSnapshot();
        });

        it('ACTIONABLE_CARD_FRAUD_ALERT with resolution', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT, {
                        originalMessage: {resolution: CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED, cardID: 11, maskedCardNumber: '4444', triggerAmount: 1000, triggerMerchant: 'ACME'},
                    }),
                }),
            ).toMatchSnapshot();
        });

        it('CARD_ISSUED with card', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, {originalMessage: {assigneeAccountID: 2, cardID: 11}}),
                    card: {
                        cardID: 11,
                        state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
                        bank: CONST.EXPENSIFY_CARD.BANK,
                        domainName: 'test.com',
                        lastUpdated: '2024-01-01',
                        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
                        lastFourPAN: '1234',
                    },
                }),
            ).toMatchSnapshot();
        });

        it('CARD_ISSUED without card', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, {originalMessage: {assigneeAccountID: 2, cardID: 11}}),
                }),
            ).toMatchSnapshot();
        });

        it('OldDot action SELECTED_FOR_RANDOM_AUDIT (markdown leak preserved)', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT),
                }),
            ).toMatchSnapshot();
        });

        it('ADD_INTEGRATION with connection name', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION, {originalMessage: {connectionName: CONST.POLICY.CONNECTIONS.NAME.QBO}}),
                }),
            ).toMatchSnapshot();
        });

        it('DELETE_INTEGRATION with connection name', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION, {originalMessage: {connectionName: CONST.POLICY.CONNECTIONS.NAME.XERO}}),
                }),
            ).toMatchSnapshot();
        });

        it('UPDATE_EMPLOYEE with role change', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE, {
                        originalMessage: {email: 'bob@test.com', field: 'role', oldValue: CONST.POLICY.ROLE.USER, newValue: CONST.POLICY.ROLE.ADMIN},
                    }),
                }),
            ).toMatchSnapshot();
        });

        it('REASSIGN_APPROVER with new approver', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER, {originalMessage: {newApproverID: 2}}),
                }),
            ).toMatchSnapshot();
        });

        it('TRAVEL_UPDATE booking ticketed', () => {
            expect(
                getAlternateText({
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
                }),
            ).toMatchSnapshot();
        });

        it('MOVED_TRANSACTION with derived report name', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, {originalMessage: {toReportID: '300', fromReportID: '100'}}),
                    reportAttributesDerived: {
                        '300': {reportName: 'Target Expense Report', isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}},
                    },
                }),
            ).toMatchSnapshot();
        });

        it('generic ADD_COMMENT in room gets actor prefix', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                }),
            ).toMatchSnapshot();
        });

        it('generic ADD_COMMENT from current user in room', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: CURRENT_USER_ACCOUNT_ID, person: [{type: 'TEXT', style: 'strong', text: 'Current User'}]}),
                }),
            ).toMatchSnapshot();
        });

        it('generic branch resolves actor from person[0].text when personalDetails miss the actor', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: 42, person: [{type: 'TEXT', style: 'strong', text: 'Mystery Person'}]}),
                }),
            ).toMatchSnapshot();
        });

        it('REPORT_PREVIEW skips actor prefix and falls to else branch', () => {
            expect(
                getAlternateText({
                    report: makeReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, reportName: 'Workspace chat'}),
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW),
                    lastMessageTextFromReport: 'owes $1.00',
                }),
            ).toMatchSnapshot();
        });
    });

    describe('report-type and fallback variants', () => {
        it('empty room falls back to welcome message', () => {
            expect(getAlternateText({lastMessageTextFromReport: ''})).toMatchSnapshot();
        });

        it('empty policy expense chat falls back to welcome message', () => {
            expect(
                getAlternateText({
                    report: makeReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, reportName: 'Workspace chat', ownerAccountID: CURRENT_USER_ACCOUNT_ID}),
                    lastMessageTextFromReport: '',
                }),
            ).toMatchSnapshot();
        });

        it('empty DM falls back to welcome message (non-chat else branch)', () => {
            expect(
                getAlternateText({
                    report: makeReport({chatType: undefined, reportName: ''}),
                    lastMessageTextFromReport: '',
                }),
            ).toMatchSnapshot();
        });

        it('empty self-DM with isTrackIntentUser true', () => {
            expect(
                getAlternateText({
                    report: makeReport({
                        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                        reportName: '',
                        participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                    }),
                    lastMessageTextFromReport: '',
                    isTrackIntentUser: true,
                }),
            ).toMatchSnapshot();
        });

        it('empty self-DM with isTrackIntentUser false', () => {
            expect(
                getAlternateText({
                    report: makeReport({
                        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                        reportName: '',
                        participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                    }),
                    lastMessageTextFromReport: '',
                }),
            ).toMatchSnapshot();
        });

        it('DM with last message shows actor prefix via shouldShowLastActorDisplayName', () => {
            expect(
                getAlternateText({
                    report: makeReport({chatType: undefined, reportName: '', lastActorAccountID: 1}),
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                }),
            ).toMatchSnapshot();
        });

        it('DM last message from current user has no actor prefix', () => {
            expect(
                getAlternateText({
                    report: makeReport({chatType: undefined, reportName: '', lastActorAccountID: CURRENT_USER_ACCOUNT_ID}),
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: CURRENT_USER_ACCOUNT_ID, person: [{type: 'TEXT', style: 'strong', text: 'Current User'}]}),
                }),
            ).toMatchSnapshot();
        });

        it('group chat with last comment', () => {
            expect(
                getAlternateText({
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
                }),
            ).toMatchSnapshot();
        });

        it('archived room skips the special-action chain', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {originalMessage: {oldName: 'Old', newName: 'New'}}),
                    isReportArchived: true,
                }),
            ).toMatchSnapshot();
        });

        it('multiline last message collapses line breaks', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                    lastMessageTextFromReport: 'line one\nline two\nline three',
                }),
            ).toMatchSnapshot();
        });

        it('SMS domain is stripped from last message', () => {
            expect(
                getAlternateText({
                    lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                    lastMessageTextFromReport: 'ping +15551234567@expensify.sms please',
                }),
            ).toMatchSnapshot();
        });
    });
});
