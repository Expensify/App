import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContext} from '@components/Search/SearchContext';
import ReportListItemHeader from '@components/SelectionListWithSections/Search/ReportListItemHeader';
import type {TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@components/AvatarWithDisplayName.tsx');

// Mock search context
const mockSearchContext = {
    currentSearchHash: 12345,
    selectedReports: {},
    selectedTransactionIDs: [],
    selectedTransactions: {},
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    setSelectedReports: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setLastSearchType: jest.fn(),
    setCurrentSearchHashAndKey: jest.fn(),
    setSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    shouldShowSelectAllMatchingItems: jest.fn(),
    selectAllMatchingItems: jest.fn(),
};

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
const renderReportListItemHeader = (reportItem: TransactionReportGroupListItemType) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            {/* @ts-expect-error - Disable TypeScript errors to simplify the test */}
            <SearchContext.Provider value={mockSearchContext}>
                <ReportListItemHeader
                    report={reportItem}
                    onSelectRow={jest.fn()}
                    onCheckboxPress={jest.fn()}
                    isDisabled={false}
                    canSelectMultiple={false}
                />
            </SearchContext.Provider>
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

    describe('UserInfoCellsWithArrow', () => {
        describe('when report type is IOU', () => {
            it('should display both submitter and recipient if both are present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'jane');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.getByText('Jane Smith')).toBeOnTheScreen();
            });

            it('should not display submitter and recipient if only submitter is present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByText('John Doe')).not.toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display submitter and receiver, even if submitter and recipient are the same', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'john');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getAllByText('John Doe')).toHaveLength(2);
                expect(screen.getByTestId('UserInfoToIndicator')).toBeOnTheScreen();
            });

            it('should not render anything if neither submitter nor recipient is present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, undefined, undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should only display submitter if recipient is invalid', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.IOU, 'john', 'fake');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
        });

        describe('when report type is EXPENSE', () => {
            it('should display both submitter and recipient if they are different', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'jane');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.getByText('Jane Smith')).toBeOnTheScreen();
            });

            it('should display submitter if only submitter is present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });

            it('should display submitter and receiver, even if submitter and recipient are the same', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'john');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getAllByText('John Doe')).toHaveLength(2);
                expect(screen.getByTestId('UserInfoToIndicator')).toBeOnTheScreen();
            });

            it('should not render anything if no participants are present', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, undefined, undefined);
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
            it('should only display submitter if recipient is invalid', async () => {
                const reportItem = createReportListItem(CONST.REPORT.TYPE.EXPENSE, 'john', 'fake');
                renderReportListItemHeader(reportItem);
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('John Doe')).toBeOnTheScreen();
                expect(screen.queryByTestId('UserInfoToIndicator')).not.toBeOnTheScreen();
            });
        });
    });
});
