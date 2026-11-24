import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getTopmostReportId: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 5;
const CURRENT_USER_LOGIN = 'current@test.com';
const OTHER_ACCOUNT_IDS = [1, 2, 3];
const POLICY_ID = '6';
// Each chat is with a different person, so no two chats tie when focus mode sorts them by name
const DIRECT_CHAT_ACCOUNT_ID = 20;
const POLICY_EXPENSE_CHAT_IDS = ['300', '301'];
const STEPS_PER_SEED = 150;
const SEEDS = [1, 2, 3];

/** Small seeded generator, so a failing sequence can be replayed. */
function createRandom(seed: number) {
    let state = seed;
    const next = () => {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state / 2147483648;
    };
    return {
        int: (max: number) => Math.floor(next() * max),
        pick: <T,>(items: T[]): T => items[Math.floor(next() * items.length)],
        chance: (probability: number) => next() < probability,
    };
}

function getTime(minute: number) {
    return `2024-01-01 ${String(10 + Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}:00.000`;
}

function getParticipants(otherAccountID: number) {
    return {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        [otherAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    };
}

function getCommentAction(reportActionID: string, created: string, actorAccountID: number): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created,
        actorAccountID,
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: 'comment', text: 'comment'}],
    };
}

function getInitialData() {
    const reports: Record<string, Report> = {};
    const reportActions: Record<string, Record<string, ReportAction>> = {};
    const transactions: Record<string, Transaction> = {};

    for (let index = 0; index < 8; index++) {
        const reportID = String(100 + index);
        reports[reportID] = {
            reportID,
            reportName: `Chat ${index}`,
            type: CONST.REPORT.TYPE.CHAT,
            participants: getParticipants(DIRECT_CHAT_ACCOUNT_ID + index),
            lastVisibleActionCreated: getTime(index),
            lastReadTime: getTime(index % 2 ? index : index - 1),
            lastActorAccountID: OTHER_ACCOUNT_IDS[index % 3],
            lastMessageText: 'hi',
        };
    }
    for (let index = 0; index < 5; index++) {
        const reportID = String(200 + index);
        reports[reportID] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: POLICY_ID,
            reportName: `#room-${index}`,
            participants: getParticipants(1),
            lastVisibleActionCreated: getTime(10 + index),
            lastReadTime: getTime(10 + index),
            lastMessageText: index % 2 ? 'room message' : '',
        };
    }
    for (const [index, reportID] of POLICY_EXPENSE_CHAT_IDS.entries()) {
        reports[reportID] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            reportName: `Workspace chat ${index}`,
            policyID: POLICY_ID,
            ownerAccountID: index ? 2 : CURRENT_USER_ACCOUNT_ID,
            isOwnPolicyExpenseChat: !index,
            participants: getParticipants(2),
            lastVisibleActionCreated: getTime(20 + index),
            lastReadTime: getTime(20 + index),
        };
    }
    for (let index = 0; index < 4; index++) {
        const reportID = String(400 + index);
        const chatReportID = POLICY_EXPENSE_CHAT_IDS[index % 2];
        const threadReportID = String(500 + index);
        const transactionID = String(600 + index);
        const iouActionID = String(700 + index);
        reports[reportID] = {
            reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: `Expense report ${index}`,
            policyID: POLICY_ID,
            chatReportID,
            parentReportID: chatReportID,
            ownerAccountID: index % 2 ? 2 : CURRENT_USER_ACCOUNT_ID,
            managerID: index % 2 ? CURRENT_USER_ACCOUNT_ID : 2,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: -1000,
            currency: CONST.CURRENCY.USD,
            participants: getParticipants(2),
            lastVisibleActionCreated: getTime(30 + index),
            lastReadTime: getTime(30 + index),
        };
        reports[threadReportID] = {
            reportID: threadReportID,
            reportName: `Expense ${index}`,
            type: CONST.REPORT.TYPE.CHAT,
            parentReportID: reportID,
            parentReportActionID: iouActionID,
            participants: getParticipants(2),
            lastVisibleActionCreated: getTime(30 + index),
            lastReadTime: getTime(30 + index),
        };
        transactions[transactionID] = {transactionID, reportID, amount: -1000, currency: CONST.CURRENCY.USD, created: '2024-01-01', merchant: 'Merchant', comment: {}};
        reportActions[reportID] = {
            [iouActionID]: {
                reportActionID: iouActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: getTime(30 + index),
                actorAccountID: CURRENT_USER_ACCOUNT_ID,
                childReportID: threadReportID,
                message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: '$10.00 expense', text: '$10.00 expense'}],
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- the backend still sends originalMessage on report actions
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactionID, IOUReportID: reportID, amount: 1000, currency: CONST.CURRENCY.USD},
            },
        };
    }
    // A chat with no visible message counts as empty and stays out of the LHN
    for (const report of Object.values(reports)) {
        if (report.type !== CONST.REPORT.TYPE.CHAT || reportActions[report.reportID]) {
            continue;
        }
        const reportActionID = String(Number(report.reportID) + 800);
        reportActions[report.reportID] = {[reportActionID]: getCommentAction(reportActionID, report.lastVisibleActionCreated ?? getTime(0), 1)};
    }
    return {reports, reportActions, transactions};
}

const policy: Policy = {
    id: POLICY_ID,
    name: 'Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: CURRENT_USER_LOGIN,
    outputCurrency: CONST.CURRENCY.USD,
    isPolicyExpenseChatEnabled: true,
    areCategoriesEnabled: true,
    requiresCategory: true,
} as Policy;

let currentReportIDForTestsValue: string | undefined;

function TestWrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <CurrentReportIDContextProvider>
                <SidebarOrderedReportsContextProvider currentReportIDForTests={currentReportIDForTestsValue}>{children}</SidebarOrderedReportsContextProvider>
            </CurrentReportIDContextProvider>
        </OnyxListItemProvider>
    );
}

/** Applies one random change of the kind the server or the user makes, and returns a label for failure messages. */
async function applyRandomChange(random: ReturnType<typeof createRandom>, step: number, reportIDs: string[], transactionIDs: string[]): Promise<string> {
    const reportID = random.pick(reportIDs);
    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    const report = await getOnyxValue(reportKey);
    const minute = 100 + step;
    switch (random.int(13)) {
        case 0:
            await Onyx.merge(reportKey, {
                lastVisibleActionCreated: getTime(minute),
                lastActorAccountID: random.pick([...OTHER_ACCOUNT_IDS, CURRENT_USER_ACCOUNT_ID]),
                lastMessageText: 'new',
            });
            return `new message in ${reportID}`;
        case 1:
            await Onyx.merge(reportKey, {lastReadTime: getTime(minute)});
            return `read ${reportID}`;
        case 2:
            await Onyx.merge(reportKey, {isPinned: !report?.isPinned});
            return `pin ${reportID}`;
        case 3: {
            const notificationPreference = random.pick([CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN]);
            await Onyx.merge(reportKey, {participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference}}});
            return `notification preference ${notificationPreference} on ${reportID}`;
        }
        case 4: {
            const state = random.pick<Pick<Report, 'stateNum' | 'statusNum'>>([
                {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN},
                {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED},
                {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED},
                {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED},
            ]);
            await Onyx.merge(reportKey, state);
            return `state ${state.stateNum}/${state.statusNum} on ${reportID}`;
        }
        case 5: {
            const hasDraft = random.chance(0.5);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, hasDraft ? 'draft' : null);
            return `draft ${hasDraft} on ${reportID}`;
        }
        case 6: {
            const transactionID = random.pick(transactionIDs);
            const shouldDelete = random.chance(0.4);
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                shouldDelete
                    ? null
                    : {transactionID, reportID: String(400 + random.int(4)), amount: -1000, currency: CONST.CURRENCY.USD, created: '2024-01-01', merchant: 'Merchant', comment: {}},
            );
            return `${shouldDelete ? 'delete' : 'move'} transaction ${transactionID}`;
        }
        case 7: {
            const transactionID = random.pick(transactionIDs);
            const hasViolation = random.chance(0.5);
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                hasViolation ? [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}] : null,
            );
            return `violation ${hasViolation} on transaction ${transactionID}`;
        }
        case 8: {
            const isArchived = random.chance(0.5);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {private_isArchived: isArchived ? getTime(minute) : ''});
            return `archived ${isArchived} on ${reportID}`;
        }
        case 9:
            await Onyx.merge(reportKey, {errorFields: random.chance(0.5) ? {addWorkspaceRoom: {[step]: 'error'}} : null});
            return `error fields on ${reportID}`;
        case 10: {
            const actionID = String(10000 + step);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[actionID]: getCommentAction(actionID, getTime(minute), random.pick(OTHER_ACCOUNT_IDS))});
            await Onyx.merge(reportKey, {lastVisibleActionCreated: getTime(minute), lastMessageText: 'comment'});
            return `comment action in ${reportID}`;
        }
        case 11:
            await Onyx.merge(reportKey, {hasOutstandingChildRequest: !report?.hasOutstandingChildRequest});
            return `outstanding child request on ${reportID}`;
        default: {
            const priorityMode = random.pick([CONST.PRIORITY_MODE.DEFAULT, CONST.PRIORITY_MODE.GSD]);
            await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, priorityMode);
            return `priority mode ${priorityMode}`;
        }
    }
}

describe('useSidebarOrderedReports', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each(SEEDS)('keeps the same LHN order as a list built from scratch after every change (seed %s)', async (seed) => {
        // Given an account with chats, rooms, workspace chats, expense reports and their one transaction threads
        const random = createRandom(seed);
        const {reports, reportActions, transactions} = getInitialData();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_LOGIN},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Current User'},
                ...Object.fromEntries(OTHER_ACCOUNT_IDS.map((accountID) => [accountID, {accountID, login: `user${accountID}@test.com`, displayName: `User ${accountID}`}])),
                ...Object.fromEntries(
                    Array.from({length: 8}, (unused, index) => [
                        DIRECT_CHAT_ACCOUNT_ID + index,
                        {accountID: DIRECT_CHAT_ACCOUNT_ID + index, login: `person${index}@test.com`, displayName: `Person ${index}`},
                    ]),
                ),
            },
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        const reportCollection: ReportCollectionDataSet = {};
        for (const [reportID, report] of Object.entries(reports)) {
            reportCollection[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = report;
        }
        const reportActionsCollection: ReportActionsCollectionDataSet = {};
        for (const [reportID, actions] of Object.entries(reportActions)) {
            reportActionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = actions;
        }
        const transactionCollection: TransactionCollectionDataSet = {};
        for (const [transactionID, transaction] of Object.entries(transactions)) {
            transactionCollection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = transaction;
        }
        await Onyx.multiSet({...reportCollection, ...reportActionsCollection, ...transactionCollection});
        await waitForBatchedUpdatesWithAct();
        currentReportIDForTestsValue = undefined;
        const {result: liveResult, rerender, unmount} = renderHook(() => useSidebarOrderedReportsState(), {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        const reportIDs = Object.keys(reports);
        const transactionIDs = [...Object.keys(transactions), '650', '651'];
        for (let step = 0; step < STEPS_PER_SEED; step++) {
            // When a random change lands, sometimes while the user opens another report
            let change = '';
            await act(async () => {
                change = await applyRandomChange(random, step, reportIDs, transactionIDs);
            });
            if (random.chance(0.15)) {
                currentReportIDForTestsValue = random.chance(0.3) ? undefined : random.pick(reportIDs);
                rerender({});
            }
            await waitForBatchedUpdatesWithAct();

            // Then the kept LHN shows the same reports in the same order as one built from scratch
            const {result: freshResult, unmount: unmountFresh} = renderHook(() => useSidebarOrderedReportsState(), {wrapper: TestWrapper});
            await waitForBatchedUpdatesWithAct();
            expect({step, change, orderedReportIDs: liveResult.current.orderedReportIDs, inboxTabCounts: liveResult.current.inboxTabCounts}).toEqual({
                step,
                change,
                orderedReportIDs: freshResult.current.orderedReportIDs,
                inboxTabCounts: freshResult.current.inboxTabCounts,
            });
            unmountFresh();
        }
        unmount();
    });
});
