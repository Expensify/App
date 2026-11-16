/**
 * Measures how the reportAttributes derived value scales with the number of reports when only one report changes,
 * on accounts shaped like a workspace admin's: workspace chats full of expense reports, plus DMs.
 */
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import reportAttributesConfig from '@userActions/OnyxDerived/configs/reportAttributes';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';

import type {OnyxMultiSetInput, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureFunction} from 'reassure';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ADMIN_ACCOUNT_ID = 1;
const ADMIN_EMAIL = 'admin@test.com';
const WORKSPACE_COUNT = 10;
const COMMENTS_PER_WORKSPACE_CHAT = 50;
const COMMENTS_PER_DM = 20;
const PERSONAL_DETAILS_COUNT = 1000;
const EXPENSE_REPORT_ERROR_EVERY = 100;
const UPDATE_SETS = 16;

type AccountData = OnyxMultiSetInput;
type ComputeArgs = Parameters<typeof reportAttributesConfig.compute>[0];

const created = (index: number) => `2026-11-${String((index % 28) + 1).padStart(2, '0')} 10:00:${String(index % 60).padStart(2, '0')}.000`;

const comment = (reportActionID: string, actorAccountID: number, index: number): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID,
    created: created(index),
    message: [{type: 'COMMENT', html: `comment ${index}`, text: `comment ${index}`}],
});

/** About 90% of the reports are expense reports spread over 10 workspace chats, the rest are DMs. */
function buildAccount(reportCount: number): {data: AccountData; firstDMReportID: string} {
    const data: AccountData = {
        [ONYXKEYS.SESSION]: {accountID: ADMIN_ACCOUNT_ID, email: ADMIN_EMAIL},
        [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
    };
    const expenseReportsPerWorkspace = Math.floor((reportCount * 0.9) / WORKSPACE_COUNT);
    const dmCount = reportCount - WORKSPACE_COUNT * (expenseReportsPerWorkspace + 1);

    for (let workspace = 1; workspace <= WORKSPACE_COUNT; workspace++) {
        const policyID = `policy${workspace}`;
        const employeeAccountID = 1000 + workspace;
        const chatReportID = String(workspace * 1_000_000);
        data[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] = {
            id: policyID,
            name: `Workspace ${workspace}`,
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: ADMIN_EMAIL,
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
        } as Policy;
        data[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] = {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID,
            ownerAccountID: employeeAccountID,
            participants: {[ADMIN_ACCOUNT_ID]: {notificationPreference: 'always'}, [employeeAccountID]: {notificationPreference: 'always'}},
            lastMessageText: 'comment',
            lastVisibleActionCreated: created(COMMENTS_PER_WORKSPACE_CHAT),
        } satisfies Report;

        const chatActions: Record<string, ReportAction> = {};
        for (let index = 1; index <= expenseReportsPerWorkspace; index++) {
            const reportID = String(workspace * 1_000_000 + index);
            const previewActionID = `${reportID}9`;
            data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                chatReportID,
                parentReportID: chatReportID,
                parentReportActionID: previewActionID,
                policyID,
                ownerAccountID: employeeAccountID,
                managerID: ADMIN_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: -1000,
                currency: CONST.CURRENCY.USD,
                reportName: `Expense Report ${reportID}`,
                lastMessageText: 'comment',
                errorFields: index % EXPENSE_REPORT_ERROR_EVERY === 0 ? {generic: {[reportID]: 'Generic error'}} : undefined,
            } satisfies Report;
            data[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = {[`${reportID}1`]: comment(`${reportID}1`, employeeAccountID, index)};
            data[`${ONYXKEYS.COLLECTION.TRANSACTION}${reportID}1`] = {
                transactionID: `${reportID}1`,
                reportID,
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: created(index),
                merchant: 'Merchant',
                comment: {},
            } satisfies Partial<Transaction>;
            chatActions[previewActionID] = {
                reportActionID: previewActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                actorAccountID: employeeAccountID,
                created: created(index),
                childReportID: reportID,
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- getOriginalMessage reads a preview's linkedReportID from here
                originalMessage: {linkedReportID: reportID},
                message: [{type: 'COMMENT', html: 'preview', text: 'preview'}],
            };
        }
        for (let index = 1; index <= COMMENTS_PER_WORKSPACE_CHAT; index++) {
            chatActions[`${chatReportID}${index}`] = comment(`${chatReportID}${index}`, employeeAccountID, index);
        }
        data[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] = chatActions;
    }

    const firstDMReportID = String(90_000_000);
    for (let dm = 0; dm < dmCount; dm++) {
        const reportID = String(90_000_000 + dm);
        const otherAccountID = 2 + (dm % PERSONAL_DETAILS_COUNT);
        data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            participants: {[ADMIN_ACCOUNT_ID]: {notificationPreference: 'always'}, [otherAccountID]: {notificationPreference: 'always'}},
            lastMessageText: 'comment',
            lastVisibleActionCreated: created(COMMENTS_PER_DM),
        } satisfies Report;
        const actions: Record<string, ReportAction> = {};
        for (let index = 1; index <= COMMENTS_PER_DM; index++) {
            actions[`${reportID}${index}`] = comment(`${reportID}${index}`, index % 2 ? ADMIN_ACCOUNT_ID : otherAccountID, index);
        }
        data[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = actions;
    }

    const personalDetailsList: Record<string, PersonalDetails> = {};
    for (let accountID = 1; accountID <= PERSONAL_DETAILS_COUNT + 1; accountID++) {
        personalDetailsList[accountID] = {accountID, login: `user${accountID}@test.com`, displayName: `User ${accountID}`};
    }
    data[ONYXKEYS.PERSONAL_DETAILS_LIST] = personalDetailsList;

    return {data, firstDMReportID};
}

/** The values reportAttributes reads, in the order of its dependencies. */
function buildComputeArgs(data: AccountData): ComputeArgs {
    const values = reportAttributesConfig.dependencies.map((dependencyKey: OnyxKey) => {
        if (!dependencyKey.endsWith('_')) {
            return data[dependencyKey];
        }
        return Object.fromEntries(Object.entries(data).filter(([key]) => key.startsWith(dependencyKey)));
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the values are built in the dependencies' order, which TypeScript can't follow through map
    return values as unknown as ComputeArgs;
}

describe('reportAttributes compute when one DM changes', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    for (const reportCount of [1000, 5000, 10000, 20000]) {
        test(`[reportAttributes] one changed DM on an account with ${reportCount / 1000}k reports`, async () => {
            // Given an account with every report already computed
            const {data, firstDMReportID} = buildAccount(reportCount);
            const args = buildComputeArgs(data);
            const currentValue: ReportAttributesDerivedValue = reportAttributesConfig.compute(args, {currentValue: undefined, sourceValues: undefined, triggeredKeys: new Set()});
            const dmKey = `${ONYXKEYS.COLLECTION.REPORT}${firstDMReportID}`;
            const [reports] = args;
            const sourceValues = {[ONYXKEYS.COLLECTION.REPORT]: {[dmKey]: reports?.[dmKey]}};

            // When only that DM changes, like after a new comment
            await measureFunction(() => reportAttributesConfig.compute(args, {currentValue, sourceValues, triggeredKeys: new Set([ONYXKEYS.COLLECTION.REPORT])}));
            // Then reassure measures one incremental compute, which should not depend on how many other reports exist
        });
    }
});

describe('Onyx.update with one DM comment on an account with 10k reports', () => {
    const {data, firstDMReportID} = buildAccount(10000);

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        await IntlStore.load(CONST.LOCALES.EN);
        await Onyx.multiSet(data);
        await waitForBatchedUpdates();
    });

    afterAll(() => Onyx.clear());

    test('[Onyx] a new comment in one DM', async () => {
        // Given an account with 10k reports and every derived value computed
        const updateSets = Array.from(
            {length: UPDATE_SETS},
            (_, index): Array<OnyxUpdate<OnyxKey>> => [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${firstDMReportID}`,
                    value: {lastMessageText: `new comment ${index}`, lastVisibleActionCreated: created(index)},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${firstDMReportID}`,
                    value: {[`new${index}`]: comment(`new${index}`, 2, index)},
                },
            ],
        );
        let setIndex = 0;

        // When a comment arrives in one DM
        await measureAsyncFunction(async () => {
            await Onyx.update(updateSets.at(setIndex % UPDATE_SETS) ?? []);
            setIndex++;
            await waitForBatchedUpdates();
        });
        // Then reassure measures the update with every derived value it recomputes
    });
});
