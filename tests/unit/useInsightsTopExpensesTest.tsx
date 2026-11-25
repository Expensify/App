import {renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import {INSIGHTS_DETAILS_SECTION_STATE} from '@pages/Insights/details/insightsDetailsSectionState';
import useInsightsTopExpenses from '@pages/Insights/details/useInsightsTopExpenses';
import {buildTopExpensesQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import currencyList from './currencyList.json';

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline})));
let mockCurrentSearchQueryJSON: SearchQueryJSON | undefined;
jest.mock('@libs/SearchQueryUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/SearchQueryUtils'),
    getCurrentSearchQueryJSON: jest.fn(() => mockCurrentSearchQueryJSON),
}));

const QUERY = 'type:expense view:table date>=2026-01-01 date<=2026-03-31';
const TOP_EXPENSES_QUERY_JSON = buildTopExpensesQueryJSON(QUERY);
const SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.SNAPSHOT}${TOP_EXPENSES_QUERY_JSON?.hash}` as const;
const ACCOUNT_ID = 1;
const APPROVER_ACCOUNT_ID = 2;
const OTHER_APPROVER_ACCOUNT_ID = 3;

/** Builds a snapshot with one expense report per expense, the expense with ID `n` costing `n` dollars. */
function buildSnapshotData(expenseCount: number, pendingDeleteID?: number): SearchResults['data'] {
    const data: Record<string, unknown> = {
        personalDetailsList: {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, avatar: '', displayName: 'Submitter', login: 'submitter@expensify.com'}},
    };
    for (let index = 1; index <= expenseCount; index++) {
        const id = String(index);
        data[`report_${id}`] = {
            accountID: ACCOUNT_ID,
            chatReportID: '9999',
            currency: 'USD',
            ownerAccountID: ACCOUNT_ID,
            policyID: 'A1B2C3',
            reportID: id,
            reportName: 'Expense Report',
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: -index * 100,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        data[`transactions_${id}`] = {
            amount: -index * 100,
            category: '',
            comment: {comment: ''},
            created: '2026-02-01',
            currency: 'USD',
            merchant: `Merchant ${id}`,
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            reportID: id,
            tag: '',
            transactionID: id,
            pendingAction: index === pendingDeleteID ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the rows only carry the fields the list reads, not the full Transaction/Report shapes
    return data as SearchResults['data'];
}

/** Returns a report's submit action, which recorded the expense's violations at submission. */
function buildSubmittedViolations(reportID: string, transactionID: string, violationNames: string[]) {
    return {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: {
            submitted: {
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                reportActionID: `submitted_${transactionID}`,
                created: '2026-02-02 10:00:00',
                message: [],
                originalMessage: {amount: 100, currency: 'USD', violations: {transactions: {[transactionID]: violationNames.map((name) => ({name}))}}},
            },
        },
    };
}

/** Returns a report's approval by `approverAccountID`, which recorded the expense's violations at approval. */
function buildApprovedViolations(reportID: string, transactionID: string, approverAccountID: number, violationNames: string[]) {
    return {
        [`approved_${approverAccountID}`]: {
            actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
            reportActionID: `approved_${reportID}_${approverAccountID}`,
            actorAccountID: approverAccountID,
            created: '2026-02-03 10:00:00',
            message: [],
            originalMessage: {amount: 100, currency: 'USD', violations: {transactions: {[transactionID]: violationNames.map((name) => ({name}))}}},
        },
    };
}

/** Returns the `search` metadata a response for the Top expenses query stores. */
function buildSearchMetadata() {
    return {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        offset: 0,
        hash: TOP_EXPENSES_QUERY_JSON?.hash,
        sortBy: TOP_EXPENSES_QUERY_JSON?.sortBy,
        sortOrder: TOP_EXPENSES_QUERY_JSON?.sortOrder,
        state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
        isLoading: false,
        hasMoreResults: false,
    };
}

function renderTopExpenses(query: string) {
    return renderHook((props: {query: string}) => useInsightsTopExpenses(props.query, buildTopExpensesQueryJSON(props.query)?.hash ?? 0), {
        initialProps: {query},
        wrapper: ({children}) => <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>{children}</ComposeProviders>,
    });
}

describe('useInsightsTopExpenses', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        mockIsOffline = false;
        mockCurrentSearchQueryJSON = undefined;
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'submitter@expensify.com'});
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('state', () => {
        it('is loading until the response arrives', async () => {
            // Given no stored response for the query
            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the skeleton with no rows
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.LOADING);
            expect(result.current.expenses).toEqual([]);
        });

        it('lists at most 10 expenses, largest first, without pending deletions', async () => {
            // Given a response holding more than 10 expenses, the 11 dollar one being deleted offline
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(12, 11), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it lists the 10 largest remaining expenses in order, since optimistic writes can add rows beyond the limit
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.READY);
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['12', '10', '9', '8', '7', '6', '5', '4', '3', '2']);
        });

        it('lists expenses the Spend tab filters out, since it filters by its own query', async () => {
            // Given the Spend tab last showed paid expenses only, and a response holding unpaid ones
            mockCurrentSearchQueryJSON = buildSearchQueryJSON('type:expense status:paid');
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(2), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it still lists them, since the Spend tab's filters don't apply to this query
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['2', '1']);
        });

        it('returns no violations when the query is not narrowed to expenses with violations', async () => {
            // Given a Spend query, which lists expenses whether or not they have violations
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(2), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then the expenses come without violations, so their rows keep the expense's details
            expect(result.current.expenses).toHaveLength(2);
            expect(result.current.violationsByTransactionID).toBeUndefined();
        });

        it("lists each expense's submitted violations, the panel's violation first", async () => {
            // Given a Receipt required panel, and expenses whose reports were submitted with violations
            const violationQuery = `${QUERY} has:${CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION}:${CONST.VIOLATIONS.RECEIPT_REQUIRED}`;
            const violationQueryJSON = buildTopExpensesQueryJSON(violationQuery);
            const data = {
                ...buildSnapshotData(2),
                ...buildSubmittedViolations('1', '1', [CONST.VIOLATIONS.OVER_LIMIT]),
                ...buildSubmittedViolations('2', '2', [CONST.VIOLATIONS.OVER_LIMIT, CONST.VIOLATIONS.RECEIPT_REQUIRED, CONST.VIOLATIONS.MISSING_CATEGORY]),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${violationQueryJSON?.hash}`, {
                data,
                search: {...buildSearchMetadata(), hash: violationQueryJSON?.hash},
            });

            // When the panel renders
            const {result} = renderTopExpenses(violationQuery);
            await waitForBatchedUpdatesWithAct();

            // Then Receipt required leads the expense that has it, followed by the rest alphabetically, and the other expense lists only its own
            expect(result.current.violationsByTransactionID?.['1']).toEqual(['Over limit']);
            expect(result.current.violationsByTransactionID?.['2']).toEqual(['Receipt required', 'Missing category', 'Over limit']);
        });

        it('lists the violations of an expense moved to another report after it was submitted', async () => {
            // Given an expense submitted with violations on one report and then moved to another
            const violationQuery = `${QUERY} has:${CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION}`;
            const violationQueryJSON = buildTopExpensesQueryJSON(violationQuery);
            const data = {...buildSnapshotData(1), ...buildSubmittedViolations('50', '1', [CONST.VIOLATIONS.OVER_LIMIT])};
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${violationQueryJSON?.hash}`, {
                data,
                search: {...buildSearchMetadata(), hash: violationQueryJSON?.hash},
            });

            // When the panel renders
            const {result} = renderTopExpenses(violationQuery);
            await waitForBatchedUpdatesWithAct();

            // Then the expense still shows the violations it was submitted with, since they stay on the report it was submitted on
            expect(result.current.violationsByTransactionID?.['1']).toEqual(['Over limit']);
        });

        it("lists only the selected approver's violations when several approvers approved the expense", async () => {
            // Given an approver's panel, and an expense two approvers approved with different violations
            const approverQuery = `${QUERY} has:${CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVER}:${APPROVER_ACCOUNT_ID}`;
            const approverQueryJSON = buildTopExpensesQueryJSON(approverQuery);
            const data = {
                ...buildSnapshotData(1),
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    ...buildApprovedViolations('1', '1', APPROVER_ACCOUNT_ID, [CONST.VIOLATIONS.OVER_LIMIT]),
                    ...buildApprovedViolations('1', '1', OTHER_APPROVER_ACCOUNT_ID, [CONST.VIOLATIONS.MISSING_CATEGORY]),
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${approverQueryJSON?.hash}`, {
                data,
                search: {...buildSearchMetadata(), hash: approverQueryJSON?.hash},
            });

            // When the panel renders
            const {result} = renderTopExpenses(approverQuery);
            await waitForBatchedUpdatesWithAct();

            // Then the expense shows only the violations the selected approver approved it with
            expect(result.current.violationsByTransactionID?.['1']).toEqual(['Over limit']);
        });

        it("lists only the violations captured in the panel's period", async () => {
            // Given a February panel, and an expense forwarded in January with one violation and approved in February with another
            const approvedQuery = `${QUERY} has:${CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL}>=2026-02-01 ${CONST.SEARCH.SYNTAX_FILTER_KEYS.ANY_APPROVAL}<=2026-02-28`;
            const approvedQueryJSON = buildTopExpensesQueryJSON(approvedQuery);
            const transactionID = '1';
            const data = {
                ...buildSnapshotData(1),
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    forwarded: {
                        actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                        reportActionID: 'forwarded_1',
                        actorAccountID: OTHER_APPROVER_ACCOUNT_ID,
                        created: '2026-01-20 10:00:00',
                        message: [],
                        originalMessage: {amount: 100, currency: 'USD', violations: {transactions: {[transactionID]: [{name: CONST.VIOLATIONS.MISSING_CATEGORY}]}}},
                    },
                    ...buildApprovedViolations('1', transactionID, APPROVER_ACCOUNT_ID, [CONST.VIOLATIONS.OVER_LIMIT]),
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.SNAPSHOT}${approvedQueryJSON?.hash}`, {
                data,
                search: {...buildSearchMetadata(), hash: approvedQueryJSON?.hash},
            });

            // When the panel renders
            const {result} = renderTopExpenses(approvedQuery);
            await waitForBatchedUpdatesWithAct();

            // Then the expense shows only the violations of its February approval
            expect(result.current.violationsByTransactionID?.[transactionID]).toEqual(['Over limit']);
        });

        it('is stale when the Search got no response', async () => {
            // Given a graph GetInsightsDetails doesn't support, whose Top expenses Search failed without reaching the server
            await Onyx.set(SNAPSHOT_KEY, {errors: {error: 'No response'}, search: {...buildSearchMetadata(), responseJsonCode: CONST.JSON_CODE.NO_RESPONSE}});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it asks the user to refresh rather than reporting an error
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.STALE);
        });

        it('is an error when the server rejected the Search', async () => {
            // Given a Top expenses Search the server answered with an error
            await Onyx.set(SNAPSHOT_KEY, {errors: {error: 'Server error'}, search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the error state
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.ERROR);
        });

        it('is offline when offline and nothing is stored for the query', async () => {
            // Given the device is offline and the query was never loaded
            mockIsOffline = true;

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then it shows the offline state instead of a skeleton that would never resolve
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.OFFLINE);
        });

        it('keeps showing stored expenses while offline', async () => {
            // Given the device is offline but the query was loaded before
            mockIsOffline = true;
            await Onyx.set(SNAPSHOT_KEY, {data: buildSnapshotData(2), search: buildSearchMetadata()});

            // When the panel renders
            const {result} = renderTopExpenses(QUERY);
            await waitForBatchedUpdatesWithAct();

            // Then the stored expenses stay visible, since they are still accurate as of the last load
            expect(result.current.state).toBe(INSIGHTS_DETAILS_SECTION_STATE.READY);
            expect(result.current.expenses.map((expense) => expense.transactionID)).toEqual(['2', '1']);
        });
    });
});
