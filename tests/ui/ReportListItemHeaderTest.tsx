import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ExpenseReportListItem from '@components/Search/SearchList/ListItem/ExpenseReportListItem';
import ReportListItemHeader from '@components/Search/SearchList/ListItem/ReportListItemHeader';
import type {ExpenseReportListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchActionsContextValue, SearchStateContextValue} from '@components/Search/types';

import useConfirmApproveReportViolations from '@hooks/useConfirmApproveReportViolations';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Transaction, TransactionViolations} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../utils/mockUsePaymentContext';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import MockSearchContextProvider from '../utils/MockSearchContextProvider';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/AvatarWithDisplayName.tsx');
jest.mock('@hooks/useConfirmApproveReportViolations', () => ({
    __esModule: true,
    default: jest.fn(jest.requireActual<{default: typeof useConfirmApproveReportViolations}>('@hooks/useConfirmApproveReportViolations').default),
}));

jest.mock('@hooks/usePaymentContext', () => {
    const {default: mockUsePaymentContext} = jest.requireActual<typeof MockUsePaymentContextUtil>('../utils/mockUsePaymentContext');
    return mockUsePaymentContext;
});

// Mock search context with all required SearchContextStateValue and SearchContextActionsValue fields
const mockSearchStateContext = {
    currentSearchHash: 12345,
    selectedReports: [],
    selectedTransactionIDs: [],
    selectedTransactions: {},
    excludedTransactions: {},
    shouldTurnOffSelectionMode: false,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
    currentSearchResults: undefined,
    currentSearchTransactionsByReportID: new Map(),
    currentSearchViolations: {},
    currentSelectedTransactionReportID: undefined,
    shouldShowFiltersBarLoading: false,
    shouldUseLiveData: false,
    currentSimilarSearchHash: -1,
    suggestedSearches: createMock<SearchStateContextValue['suggestedSearches']>({}),
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldResetSearchQuery: false,
    sortedReportIDs: [],
    hasSelectedTransactions: false,
} satisfies SearchStateContextValue;

const mockSearchActionsContext = {
    clearSelectedTransactions: jest.fn(),
    setLastSearchType: jest.fn(),
    setCurrentSelectedTransactionReportID: jest.fn(),
    setSelectedTransactions: jest.fn(),
    getSelectedTransactions: jest.fn(() => ({})),
    getExcludedTransactions: () => ({}),
    getAreAllMatchingItemsSelected: () => false,
    applySelection: jest.fn(),
    setSelectedReports: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    selectAllMatchingItems: jest.fn(),
    setShouldResetSearchQuery: jest.fn(),
    removeTransaction: jest.fn(),
    setSortedReportIDs: jest.fn(),
    getSearchKeyForQuery: jest.fn(),
} satisfies SearchActionsContextValue;

const mockPersonalDetails: Record<string, PersonalDetails> = {
    john: {
        accountID: 1,
        displayName: 'John Doe',
        login: 'john.doe@example.com',
        avatar: 'https://example.com/avatar1.jpg',
    },
    jane: {
        accountID: 2,
        displayName: 'Jane Smith',
        login: 'jane.smith@example.com',
        avatar: 'https://example.com/avatar2.jpg',
    },
    fake: {
        accountID: 0,
        displayName: '',
        login: '',
        avatar: '',
    },
};

const mockPolicy = createRandomPolicy(1);
const createReportListItem = (
    type: ValueOf<typeof CONST.REPORT.TYPE>,
    from?: string,
    to?: string,
    options: Partial<TransactionReportGroupListItemType> = {},
): TransactionReportGroupListItemType => ({
    shouldAnimateInHighlight: false,
    action: 'view' as const,
    chatReportID: '123',
    created: '2024-01-01',
    currency: 'USD',
    isOneTransactionReport: false,
    isPolicyExpenseChat: false,
    isWaitingOnBankAccount: false,
    nonReimbursableTotal: 0,
    policyID: mockPolicy.id,
    private_isArchived: '',
    reportID: '789',
    reportName: 'Test Report',
    stateNum: 1,
    statusNum: 1,
    total: 100,
    type,
    unheldTotal: 100,
    keyForList: '789',
    // @ts-expect-error - Intentionally allowing undefined for testing edge cases
    from: from ? mockPersonalDetails[from] : undefined,
    // @ts-expect-error - Intentionally allowing undefined for testing edge cases
    to: to ? mockPersonalDetails[to] : undefined,
    transactions: [],
    ...options,
});

// Helper function to wrap component with context
const renderReportListItemHeader = (reportItem: TransactionReportGroupListItemType, searchState: SearchStateContextValue = mockSearchStateContext, renderExpenseReportRow = false) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MockSearchContextProvider
                state={searchState}
                actions={mockSearchActionsContext}
            >
                {renderExpenseReportRow ? (
                    <ExpenseReportListItem
                        item={createMock<ExpenseReportListItemType>(reportItem)}
                        onSelectRow={jest.fn()}
                        showTooltip={false}
                    />
                ) : (
                    <ReportListItemHeader
                        report={reportItem}
                        onSelectRow={jest.fn()}
                        onCheckboxPress={jest.fn()}
                        isDisabled={false}
                        canSelectMultiple={false}
                    />
                )}
            </MockSearchContextProvider>
        </ComposeProviders>,
    );
};

describe('ReportListItemHeader', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it.each([false, true])('passes snapshot-only expenses and violations to approval (expense report row: %s)', async (renderExpenseReportRow) => {
        // Given an unopened report whose expenses and warnings exist only in Search results
        const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE);
        const transaction = createMock<Transaction>({transactionID: 'snapshot-only', reportID: reportItem.reportID, merchant: 'Merchant', amount: 100, currency: 'USD'});
        const violations: TransactionViolations = [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING}];
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}` as const;

        // When the report header renders without any corresponding live transaction or violation record
        renderReportListItemHeader(
            reportItem,
            {
                ...mockSearchStateContext,
                currentSearchTransactionsByReportID: new Map([[reportItem.reportID, [transaction]]]),
                currentSearchViolations: {[key]: violations},
            },
            renderExpenseReportRow,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the warning hook receives the same snapshot data rather than an empty live collection
        expect(useConfirmApproveReportViolations).toHaveBeenCalledWith(expect.objectContaining({transactions: [transaction], violationsCollection: {[key]: violations}}));
    });

    describe('UserInfoCellsWithArrow', () => {
        describe('when report type is IOU', () => {
            it('should display only submitter without recipient on narrow layout', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'jane');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByText('Jane Smith')).not.toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should not display submitter if recipient is missing', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByText('John Doe')).not.toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display only submitter even if submitter and recipient are the same', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'john');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getAllByText('John Doe')).toHaveLength(1);
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should not render anything if neither submitter nor recipient is present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, undefined, undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display only submitter if recipient is invalid', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'fake');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
        });

        describe('when report type is EXPENSE', () => {
            it('should display only submitter without recipient on narrow layout', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'jane');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByText('Jane Smith')).not.toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display submitter if only submitter is present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display only submitter even if submitter and recipient are the same', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'john');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getAllByText('John Doe')).toHaveLength(1);
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should not render anything if no participants are present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, undefined, undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
            it('should display only submitter if recipient is invalid', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'fake');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
        });
    });
});
