import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_COUNT = 3000;
const ACTIONS_PER_REPORT = 20;
const TRANSACTION_COUNT = 1000;
const POLICY_COUNT = 50;
const PERSONAL_DETAILS_COUNT = 1000;

const UPDATE_SETS = 16;
const FIRST_ACCOUNT_ID = 1;

type ReconnectSize = {reportCount: number; transactionCount: number; policyCount: number};
const LARGE_RECONNECT: ReconnectSize = {reportCount: 1000, transactionCount: 300, policyCount: 50};
const SMALL_RECONNECT: ReconnectSize = {reportCount: 30, transactionCount: 10, policyCount: 2};

const reports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({...createRandomReport(index + 1, undefined), type: CONST.REPORT.TYPE.CHAT, policyID: String((index % POLICY_COUNT) + 1)}),
    REPORT_COUNT,
);

const reportActions: Record<string, Record<string, ReportAction>> = {};
for (let reportIndex = 1; reportIndex <= REPORT_COUNT; reportIndex++) {
    const actions: Record<string, ReportAction> = {};
    for (let actionIndex = 0; actionIndex < ACTIONS_PER_REPORT; actionIndex++) {
        const action = createRandomReportAction(reportIndex * 100 + actionIndex);
        actions[action.reportActionID] = action;
    }
    reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIndex}`] = actions;
}

const transactions = createCollection<Transaction>(
    (item) => `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}`,
    (index) => ({...createRandomTransaction(index + 1), reportID: String((index % REPORT_COUNT) + 1)}),
    TRANSACTION_COUNT,
);

const policies = createCollection<Policy>(
    (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
    (index) => createRandomPolicy(index + 1),
    POLICY_COUNT,
);

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index + 1),
    PERSONAL_DETAILS_COUNT,
);

/** One ReconnectApp-shaped batch: a merge per changed key, like the server's queued Onyx updates. */
function buildReconnectUpdates(setIndex: number, {reportCount, transactionCount, policyCount}: ReconnectSize): Array<OnyxUpdate<OnyxKey>> {
    const updates: Array<OnyxUpdate<OnyxKey>> = [];
    const created = `2026-11-11 10:${String(setIndex).padStart(2, '0')}:00.000`;
    for (let reportIndex = 1; reportIndex <= reportCount; reportIndex++) {
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportIndex}`,
            value: {lastVisibleActionCreated: created, lastMessageText: `message ${setIndex}`, lastReadTime: created},
        });
        const action = createRandomReportAction(10_000_000 + setIndex * 100_000 + reportIndex);
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIndex}`,
            value: {[action.reportActionID]: {...action, created}},
        });
    }
    for (let transactionIndex = 1; transactionIndex <= transactionCount; transactionIndex++) {
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIndex}`,
            value: {merchant: `merchant ${setIndex}`, modifiedAmount: setIndex * 100},
        });
    }
    for (let policyIndex = 1; policyIndex <= policyCount; policyIndex++) {
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyIndex}`,
            value: {name: `Workspace ${setIndex}`},
        });
    }
    updates.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        value: {[FIRST_ACCOUNT_ID]: {displayName: `User ${setIndex}`}},
    });
    return updates;
}

const largeUpdateSets = Array.from({length: UPDATE_SETS}, (_, index) => buildReconnectUpdates(index, LARGE_RECONNECT));
const smallUpdateSets = Array.from({length: UPDATE_SETS}, (_, index) => buildReconnectUpdates(UPDATE_SETS + index, SMALL_RECONNECT));

async function measureUpdates(updateSets: Array<Array<OnyxUpdate<OnyxKey>>>) {
    let setIndex = 0;
    await measureAsyncFunction(async () => {
        const updates = updateSets.at(setIndex % UPDATE_SETS) ?? [];
        setIndex++;
        await Onyx.update(updates);
        await waitForBatchedUpdates();
    });
}

describe('Onyx.update with a ReconnectApp-sized response', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();

        await Onyx.multiSet({
            ...reports,
            ...reportActions,
            ...transactions,
            ...policies,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
            [ONYXKEYS.SESSION]: {accountID: 1, email: 'test@example.com'},
        });
        await waitForBatchedUpdates();
    });

    afterAll(() => Onyx.clear());

    test('[Onyx] update with 2.4k merges across 4 collections', async () => {
        await measureUpdates(largeUpdateSets);
    });

    test('[Onyx] update with 73 merges on an account with 3k reports', async () => {
        await measureUpdates(smallUpdateSets);
    });
});
