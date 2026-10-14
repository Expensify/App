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

// The server snapshot from the first Drafts page load, counting every draft report at that time.
const draftsSnapshot = createMock<SearchResults>({
    search: {
        hash: mockQueryContext.currentSearchHash,
        offset: 0,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        hasMoreResults: true,
        hasResults: true,
        isLoading: false,
        count: DRAFT_REPORT_IDS.length,
        reportCount: DRAFT_REPORT_IDS.length,
    },
    data: {},
});

function renderProvider() {
    return renderHook(() => use(SearchResultsContext), {
        wrapper: ({children}: {children: React.ReactNode}) => <SearchResultsProvider>{children}</SearchResultsProvider>,
    });
}

async function seedDrafts() {
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
}

describe('SearchResultsProvider live to-do report count', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('lowers the report count when a report leaves the Drafts bucket, even though the snapshot still holds the old server count', async () => {
        // Given the Drafts search, whose server snapshot counted the three draft reports when the page loaded
        await seedDrafts();
        await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${mockQueryContext.currentSearchHash}`, draftsSnapshot);
        await waitForBatchedUpdates();
        const {result} = renderProvider();
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(result.current.shouldUseLiveData).toBe(true);
        expect(result.current.currentSearchResults?.search.reportCount).toBe(3);

        // When one report is submitted from its row, which moves it out of Drafts without refetching the snapshot
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${DRAFT_REPORT_IDS.at(0)}`, {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            });
            await waitForBatchedUpdates();
        });

        // Then the count the "Select all" label and the footer read drops by one, the same as the Drafts badge
        expect(result.current.currentSearchResults?.search.reportCount).toBe(2);
        expect(result.current.currentSearchResults?.search.count).toBe(2);
    });

    it('reports the live count before any server snapshot exists, so the select-all label has a count offline', async () => {
        // Given the Drafts reports in Onyx and no snapshot yet, as when the search is opened offline
        await seedDrafts();
        await waitForBatchedUpdates();

        // When the provider builds the live results
        const {result} = renderProvider();
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then the report count is already the number of draft reports instead of being missing
        expect(result.current.currentSearchResults?.search.reportCount).toBe(3);
    });
});
