import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';

import {clearAlternateTextCache, clearFilteredOptionListCache, createFilteredOptionList, getValidOptions} from '@libs/OptionsListUtils';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type Login from '@src/types/onyx/Login';

import type * as NativeNavigation from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';

import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * The reports built by `tests/utils/collections/reports.ts#createRandomReport` carry neither participants nor a
 * chatType, so `processReport` discards every one of them before `createOption` runs. That makes the existing
 * OptionsListUtils / SearchRouter perf suites blind to the chat-preview path (`createOption` ->
 * `getLastMessageTextForReport` / `getAlternateText` -> `getReportAlternateText`).
 *
 * These scenarios build participant-bearing reports with report actions behind them, so the preview path runs for
 * every option built. `createFilteredOptionList` builds all `REPORTS_COUNT` of them; the `getValidOptions` scenarios
 * resolve a preview for `maxElements` options, which is what the consumers (SearchRouter, chat finder) actually cap at.
 *
 * `ACTIONS_PER_REPORT` is deliberately larger than a couple of actions: the last-visible-action lookup scans the
 * report's actions, so a short list hides that cost. Expense/IOU reports also get a populated transaction thread, so
 * the two-collection lookup walks real actions instead of an empty one. Fixtures are deterministic (no falso) to keep
 * baseline and current runs comparable.
 */

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user1@example.com';
const REPORTS_COUNT = 300;
const PERSONAL_DETAILS_COUNT = 300;
const ACTIONS_PER_REPORT = 40;
const THREAD_ACTIONS_PER_REPORT = 10;
const MAX_ELEMENTS = 20;
const WIDE_MAX_ELEMENTS = 100;
const POLICY_ID = 'policy1';

const REPORT_TYPES = [CONST.REPORT.TYPE.CHAT, CONST.REPORT.TYPE.EXPENSE, CONST.REPORT.TYPE.IOU, CONST.REPORT.TYPE.TASK] as const;

const ACTION_NAMES = [
    CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    CONST.REPORT.ACTIONS.TYPE.IOU,
    CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
    CONST.REPORT.ACTIONS.TYPE.RENAMED,
    CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
    CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
] as const;

/** Deterministic timestamp, ordered by the action index so the newest action is stable across runs. */
function buildCreated(reportIndex: number, actionIndex: number): string {
    const day = (reportIndex % 27) + 1;
    const totalMinutes = actionIndex * 7;
    const hour = 10 + Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `2026-01-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000`;
}

function buildOriginalMessage(actionName: TupleToUnion<typeof ACTION_NAMES>, reportIndex: number) {
    switch (actionName) {
        case CONST.REPORT.ACTIONS.TYPE.IOU:
            return {
                IOUReportID: `${reportIndex}`,
                IOUTransactionID: `transaction${reportIndex}`,
                amount: 1000 + reportIndex,
                currency: CONST.CURRENCY.USD,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                participantAccountIDs: [CURRENT_USER_ACCOUNT_ID, (reportIndex % PERSONAL_DETAILS_COUNT) + 2],
            };
        case CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW:
            return {linkedReportID: `${reportIndex}`};
        case CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE:
            return {
                amount: 2000 + reportIndex,
                oldAmount: 1000 + reportIndex,
                currency: CONST.CURRENCY.USD,
                oldCurrency: CONST.CURRENCY.USD,
            };
        case CONST.REPORT.ACTIONS.TYPE.RENAMED:
            return {oldName: `Old room ${reportIndex}`, newName: `New room ${reportIndex}`, html: `New room ${reportIndex}`, lastModified: buildCreated(reportIndex, 0)};
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
            return {cardID: reportIndex + 1, assigneeAccountID: CURRENT_USER_ACCOUNT_ID};
        default:
            return {html: `<p>Message ${reportIndex}</p>`, lastModified: buildCreated(reportIndex, 0)};
    }
}

function buildReportAction(reportIndex: number, actionIndex: number): ReportAction {
    const actionName = ACTION_NAMES[actionIndex % ACTION_NAMES.length];
    const actorAccountID = (reportIndex % PERSONAL_DETAILS_COUNT) + 2;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the fixture only carries the fields the chat-preview path reads
    return {
        reportActionID: `${reportIndex}_${actionIndex}`,
        actionName,
        actorAccountID,
        created: buildCreated(reportIndex, actionIndex),
        person: [{type: 'TEXT', style: 'strong', text: `User ${actorAccountID}`}],
        message: [
            {
                type: 'COMMENT',
                html: `<p>Message ${reportIndex} ${actionIndex}</p>`,
                text: `Message ${reportIndex} ${actionIndex}`,
                style: 'normal',
            },
        ],
        originalMessage: buildOriginalMessage(actionName, reportIndex),
    } as unknown as ReportAction;
}

const personalDetails: Record<string, PersonalDetails> = {};
for (let index = 0; index < PERSONAL_DETAILS_COUNT; index++) {
    const accountID = index + 1;
    personalDetails[accountID] = {
        accountID,
        login: `user${accountID}@example.com`,
        displayName: `User ${accountID}`,
        firstName: 'User',
        lastName: `${accountID}`,
        avatar: '',
    } as PersonalDetails;
}

const reports: Record<string, Report> = {};
const reportActions: Record<string, ReportActions> = {};
const threadReports: Record<string, Report> = {};
const transactionThreadIDs: Record<string, string | undefined> = {};
const lastActions: Record<string, ReportAction> = {};

for (let index = 0; index < REPORTS_COUNT; index++) {
    const reportID = `${index}`;
    const otherAccountID = (index % PERSONAL_DETAILS_COUNT) + 2;
    const type = REPORT_TYPES[index % REPORT_TYPES.length];
    const isPolicyExpenseChat = index % 3 === 0;
    const lastActionIndex = ACTIONS_PER_REPORT - 1;

    reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
        reportID,
        type,
        chatType: isPolicyExpenseChat ? CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT : undefined,
        isOwnPolicyExpenseChat: isPolicyExpenseChat,
        policyID: isPolicyExpenseChat ? POLICY_ID : undefined,
        reportName: `Report ${index}`,
        currency: CONST.CURRENCY.USD,
        ownerAccountID: otherAccountID,
        lastActorAccountID: otherAccountID,
        lastVisibleActionCreated: buildCreated(index, lastActionIndex),
        lastActionType: ACTION_NAMES[lastActionIndex % ACTION_NAMES.length],
        // Left empty on purpose: the preview then has to be recomputed from the report actions,
        // which is what the LHN and Search both do for a report whose last message is not cached.
        lastMessageText: '',
        participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, otherAccountID]),
    } as Report;

    const actions: ReportActions = {};
    for (let actionIndex = 0; actionIndex < ACTIONS_PER_REPORT; actionIndex++) {
        const action = buildReportAction(index, actionIndex);
        actions[action.reportActionID] = action;
        if (actionIndex === lastActionIndex) {
            lastActions[reportID] = action;
        }
    }
    reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = actions;

    if (type === CONST.REPORT.TYPE.EXPENSE || type === CONST.REPORT.TYPE.IOU) {
        const threadReportID = `${index + REPORTS_COUNT}`;
        transactionThreadIDs[reportID] = threadReportID;

        // The transaction thread has to exist with actions of its own, otherwise the two-collection
        // last-visible-action lookup short-circuits on an empty collection and the scenario never pays for it.
        threadReports[`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`] = {
            reportID: threadReportID,
            type: CONST.REPORT.TYPE.CHAT,
            reportName: `Transaction thread ${index}`,
            parentReportID: reportID,
            parentReportActionID: `${index}_1`,
            ownerAccountID: otherAccountID,
            lastActorAccountID: otherAccountID,
            lastVisibleActionCreated: buildCreated(index + REPORTS_COUNT, THREAD_ACTIONS_PER_REPORT - 1),
            lastMessageText: '',
            participants: buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, otherAccountID]),
        } as Report;

        const threadActions: ReportActions = {};
        for (let actionIndex = 0; actionIndex < THREAD_ACTIONS_PER_REPORT; actionIndex++) {
            const action = buildReportAction(index + REPORTS_COUNT, actionIndex);
            threadActions[action.reportActionID] = action;
        }
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`] = threadActions;
    }
}

const allPolicies: Record<string, Policy> = {
    [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: {
        id: POLICY_ID,
        name: 'Test Policy',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: CURRENT_USER_EMAIL,
        outputCurrency: CONST.CURRENCY.USD,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
    } as Policy,
};

const EMPTY_PRIVATE_IS_ARCHIVED_MAP: PrivateIsArchivedMap = {};
const loginList: OnyxEntry<Login> = {};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

const buildOptionList = () =>
    createFilteredOptionList(
        personalDetails,
        reports,
        undefined,
        EMPTY_PRIVATE_IS_ARCHIVED_MAP,
        allPolicies,
        {
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            currentUserLogin: CURRENT_USER_EMAIL,
            dateFnsLocale: undefined,
            convertToDisplayString,
            conciergeReportID: undefined,
            maxRecentReports: REPORTS_COUNT,
            transactionThreadIDs,
            lastActions,
        },
        undefined,
    );

const getPreviewOptionsConfig = (maxElements: number) => ({
    dateFnsLocale: undefined,
    convertToDisplayString,
    betas: Object.values(CONST.BETAS),
    includeRecentReports: true,
    includeTasks: true,
    includeThreads: true,
    includeMoneyRequests: true,
    includeMultipleParticipantReports: true,
    includeSelfDM: true,
    includeOwnedWorkspaceChats: true,
    showChatPreviewLine: true,
    // Left false so the policy expense chats resolve a preview too; with it on, a third of the options
    // short-circuit to the policy name and never enter the path this suite measures.
    forcePolicyNamePreview: false,
    maxElements,
    personalDetails,
    sortedActions: undefined,
    transactionThreadIDs,
    lastActions,
    currentUserLogin: CURRENT_USER_EMAIL,
});

describe('OptionsListChatPreview', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {...reports, ...threadReports});
        Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, reportActions);
        Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, allPolicies);
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[OptionsListChatPreview] createFilteredOptionList with participant reports', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => {
            // Inputs are referentially identical across measured runs, so clear the cache to measure the build path.
            clearFilteredOptionListCache();
            return buildOptionList();
        });
    });

    test('[OptionsListChatPreview] getValidOptions with chat previews', async () => {
        await waitForBatchedUpdates();
        const optionList = buildOptionList();
        await measureFunction(() =>
            getValidOptions(
                {reports: optionList.reports, personalDetails: optionList.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                getPreviewOptionsConfig(MAX_ELEMENTS),
                translateLocal,
                undefined,
            ),
        );
    });

    test('[OptionsListChatPreview] getValidOptions with chat previews and a wider result cap', async () => {
        await waitForBatchedUpdates();
        const optionList = buildOptionList();
        await measureFunction(() =>
            getValidOptions(
                {reports: optionList.reports, personalDetails: optionList.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                getPreviewOptionsConfig(WIDE_MAX_ELEMENTS),
                translateLocal,
                undefined,
            ),
        );
    });

    test('[OptionsListChatPreview] getValidOptions with chat previews, preview cache cold', async () => {
        await waitForBatchedUpdates();
        const optionList = buildOptionList();
        await measureFunction(() => {
            clearAlternateTextCache();
            return getValidOptions(
                {reports: optionList.reports, personalDetails: optionList.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                getPreviewOptionsConfig(MAX_ELEMENTS),
                translateLocal,
                undefined,
            );
        });
    });

    test('[OptionsListChatPreview] getValidOptions with chat previews and a wider result cap, preview cache cold', async () => {
        await waitForBatchedUpdates();
        const optionList = buildOptionList();
        await measureFunction(() => {
            clearAlternateTextCache();
            return getValidOptions(
                {reports: optionList.reports, personalDetails: optionList.personalDetails},
                allPolicies,
                {},
                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                getPreviewOptionsConfig(WIDE_MAX_ELEMENTS),
                translateLocal,
                undefined,
            );
        });
    });
});
