import {act, renderHook} from '@testing-library/react-native';

import {SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import SearchResultsProvider from '@components/Search/SearchResultsProvider';

import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';

import React, {use} from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const APPROVER_ACCOUNT_ID = 2;
const POLICY_ID = 'policy123';
const DRAFT_REPORT_IDS = ['draft_1', 'draft_2', 'draft_3'];

// The server matched more drafts than this device holds, as on an account whose to-dos aren't all loaded. Each draft
// has one 10.00 expense.
const SERVER_REPORT_COUNT = 120;
const EXPENSE_AMOUNT = 1000;

const suggestedSearches = getSuggestedSearches(CURRENT_USER_ACCOUNT_ID);
const draftsQueryJSON = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQueryJSON;

const mockQueryContext = {
    currentSearchHash: draftsQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID,
    currentSearchKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
    currentSearchQueryJSON: draftsQueryJSON,
    suggestedSearches,
};
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => mockQueryContext,
}));

const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${mockQueryContext.currentSearchHash}` as const;
const firstDraftReportID = DRAFT_REPORT_IDS.at(0) ?? '';

const draftReport = (reportID: string): Report =>
    createMock<Report>({
        reportID,
        chatReportID: `chat_${reportID}`,
        policyID: POLICY_ID,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: APPROVER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        type: CONST.REPORT.TYPE.EXPENSE,
        currency: 'USD',
    });

const draftTransaction = (reportID: string): Transaction =>
    createMock<Transaction>({
        transactionID: `transaction_${reportID}`,
        reportID,
        amount: -1000,
        currency: 'USD',
        merchant: 'Merchant',
        created: '2026-10-13',
        reimbursable: true,
        groupAmount: -1000,
        groupCurrency: 'USD',
    });

// The first page the server returned when Drafts loaded: the three drafts this device holds, out of SERVER_REPORT_COUNT.
const draftsSnapshotData = createMock<SearchResults['data']>({});
for (const reportID of DRAFT_REPORT_IDS) {
    Object.assign(draftsSnapshotData, {
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const]: draftReport(reportID),
        [`${ONYXKEYS.COLLECTION.TRANSACTION}${draftTransaction(reportID).transactionID}` as const]: draftTransaction(reportID),
    });
}

const draftsSnapshot = createMock<SearchResults>({
    search: {
        hash: mockQueryContext.currentSearchHash,
        offset: 0,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        hasMoreResults: true,
        hasResults: true,
        isLoading: false,
        count: SERVER_REPORT_COUNT,
        reportCount: SERVER_REPORT_COUNT,
        total: SERVER_REPORT_COUNT * EXPENSE_AMOUNT,
        currency: 'USD',
        footerTotal: CONST.SEARCH.FOOTER_TOTAL.TOTAL,
        countedReportIDs: Object.fromEntries(DRAFT_REPORT_IDS.map((reportID) => [reportID, true])),
    },
    data: draftsSnapshotData,
});

function renderProvider() {
    return renderHook(() => use(SearchResultsContext), {
        wrapper: ({children}: {children: React.ReactNode}) => <SearchResultsProvider>{children}</SearchResultsProvider>,
    });
}

async function seedDraftsAndSnapshot() {
    const policy = createMock<Policy>({
        id: POLICY_ID,
        name: 'Test Policy',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: CURRENT_USER_EMAIL,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        outputCurrency: 'USD',
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    });

    await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await Promise.all(DRAFT_REPORT_IDS.map((reportID) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, draftReport(reportID))));
    await Promise.all(DRAFT_REPORT_IDS.map((reportID) => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${draftTransaction(reportID).transactionID}`, draftTransaction(reportID))));
    await Onyx.set(snapshotKey, draftsSnapshot);
    await waitForBatchedUpdates();
}

async function renderDrafts() {
    await seedDraftsAndSnapshot();
    const rendered = renderProvider();
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return rendered;
}

async function moveFirstDraft(stateNum: Report['stateNum'], statusNum: Report['statusNum']) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${firstDraftReportID}`, {stateNum, statusNum});
        await waitForBatchedUpdates();
    });
}

// The last draft stands for a report from a later page, which a first-page response leaves out of its record.
const laterPageDraftReportID = DRAFT_REPORT_IDS.at(-1) ?? '';
const firstPageDraftReportIDs = DRAFT_REPORT_IDS.filter((reportID) => reportID !== laterPageDraftReportID);

async function submitDraft(reportID: string) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED});
        await waitForBatchedUpdates();
    });
}

/** A first-page response, which replaces the snapshot with the server's fresh count and a record of page 1 */
async function answerFirstPage(reportCount: number) {
    await act(async () => {
        await Onyx.set(snapshotKey, {
            ...draftsSnapshot,
            search: {...draftsSnapshot.search, reportCount, countedReportIDs: Object.fromEntries(firstPageDraftReportIDs.map((reportID) => [reportID, true]))},
        });
        await waitForBatchedUpdates();
    });
}

function getReportCount(result: Awaited<ReturnType<typeof renderDrafts>>['result']) {
    return result.current.currentSearchResults?.search?.reportCount;
}

function expectFigures(result: Awaited<ReturnType<typeof renderDrafts>>['result'], reportCount: number, deviceDraftCount: number) {
    const search = result.current.currentSearchResults?.search;
    expect(search?.reportCount).toBe(reportCount);
    expect(search?.count).toBe(deviceDraftCount);
    expect(search?.total).toBe(deviceDraftCount * EXPENSE_AMOUNT);
    expect(search?.currency).toBe('USD');
}

describe('SearchResultsProvider live to-do report count', () => {
    beforeAll(() => {
        // As in the app, Onyx.update copies pending markers into the snapshots that hold the updated keys.
        Onyx.init({keys: ONYXKEYS, snapshotMergeKeys: ['pendingAction', 'pendingFields']});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it("keeps the server's report count when the device holds only some of the matching reports", async () => {
        // Given Drafts on a device that holds three of the 120 drafts the server counted
        // When the provider builds the live results
        const {result} = await renderDrafts();

        // Then "Select all" counts every matching report, not only the three on the device
        expect(result.current.shouldUseLiveData).toBe(true);
        expectFigures(result, SERVER_REPORT_COUNT, DRAFT_REPORT_IDS.length);
    });

    it('keeps a counted report this device never lists on the count, such as one its own rules hide', async () => {
        // Given Drafts whose server responses also held a draft this device doesn't list
        const {result} = await renderDrafts();
        await act(async () => {
            await Onyx.merge(snapshotKey, {search: {countedReportIDs: {hiddenDraft: true}}});
            await waitForBatchedUpdates();
        });

        // When the provider builds the live results
        // Then the server's 120 stand, since "Select all" still acts on that draft
        expect(getReportCount(result)).toBe(SERVER_REPORT_COUNT);
    });

    it('lowers the report count as soon as a report leaves Drafts, without a new search', async () => {
        // Given Drafts with the server's 120 reports
        const {result} = await renderDrafts();

        // When one draft is submitted from its row, which moves it out of Drafts on this device
        await moveFirstDraft(CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED);

        // Then the report count drops with it, like the Drafts badge does
        expectFigures(result, SERVER_REPORT_COUNT - 1, DRAFT_REPORT_IDS.length - 1);
    });

    it('keeps it lowered after the submit succeeds and removes the report from the snapshot', async () => {
        // Given a draft that was submitted from its row
        const {result} = await renderDrafts();
        await moveFirstDraft(CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED);

        // When the submit succeeds and its success data removes the report's row from the snapshot
        await act(async () => {
            await Onyx.merge(snapshotKey, {data: {[`${ONYXKEYS.COLLECTION.REPORT}${firstDraftReportID}`]: null}});
            await waitForBatchedUpdates();
        });

        // Then the report count stays lowered instead of jumping back to the server's old one
        expectFigures(result, SERVER_REPORT_COUNT - 1, DRAFT_REPORT_IDS.length - 1);
    });

    it('puts the report back in the report count when a failed submit returns it to Drafts', async () => {
        // Given a draft that was submitted from its row
        const {result} = await renderDrafts();
        await moveFirstDraft(CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED);

        // When the submit fails and its failure data returns the report to Drafts
        await moveFirstDraft(CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN);

        // Then the report count is the server's again, without anything having to restore it
        expectFigures(result, SERVER_REPORT_COUNT, DRAFT_REPORT_IDS.length);
    });

    it('takes nothing off for a draft created on this device and then submitted, even once its creation succeeded', async () => {
        // Given Drafts with the server's 120 reports, and a draft created on this device, which the app writes into the snapshot with its pending markers
        const {result} = await renderDrafts();
        const createdReportKey = `${ONYXKEYS.COLLECTION.REPORT}created` as const;
        const createdTransaction = {...draftTransaction('created'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        const createdTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${createdTransaction.transactionID}` as const;
        const createdReport = {...draftReport('created'), pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}};
        const createdSnapshotData = createMock<SearchResults['data']>({});
        Object.assign(createdSnapshotData, {[createdReportKey]: createdReport, [createdTransactionKey]: createdTransaction});
        await act(async () => {
            await Onyx.set(createdReportKey, createdReport);
            await Onyx.set(createdTransactionKey, createdTransaction);
            await Onyx.merge(snapshotKey, {data: createdSnapshotData});
            await waitForBatchedUpdates();
        });

        // When the creation succeeds, its success data clearing the pending markers through Onyx.update, which also clears them in the snapshot
        await act(async () => {
            await Onyx.update([
                {onyxMethod: Onyx.METHOD.MERGE, key: createdReportKey, value: {pendingFields: {createReport: null}}},
                {onyxMethod: Onyx.METHOD.MERGE, key: createdTransactionKey, value: {pendingAction: null}},
            ]);
            await waitForBatchedUpdates();
        });

        // And the draft is then submitted
        await act(async () => {
            await Onyx.merge(createdReportKey, {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED});
            await waitForBatchedUpdates();
        });

        // Then the server's 120 stand, since the draft isn't among the reports its responses held
        expect(result.current.currentSearchResults?.search?.reportCount).toBe(SERVER_REPORT_COUNT);
    });

    it("doesn't take a report off twice when a first-page response lands after it left", async () => {
        // Given a later-page draft submitted, so the count drops to 119
        const {result} = await renderDrafts();
        await submitDraft(laterPageDraftReportID);
        expect(getReportCount(result)).toBe(SERVER_REPORT_COUNT - 1);

        // When a first-page response brings the server's fresh count, which no longer covers it, and a record of page 1
        await answerFirstPage(SERVER_REPORT_COUNT - 1);

        // Then the count stays at 119, since the fresh count already left it out
        expect(getReportCount(result)).toBe(SERVER_REPORT_COUNT - 1);
    });
});
