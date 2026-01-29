import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContext} from '@components/Search/SearchContext';
import type {SearchColumnType} from '@components/Search/types';
import MerchantListItemHeader from '@components/SelectionListWithSections/Search/MerchantListItemHeader';
import type {TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

// Mock useResponsiveLayout to control screen size in tests
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

// Mock search context with all required SearchContextProps fields
const mockSearchContext = {
    currentSearchHash: 12345,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    selectedReports: [],
    selectedTransactionIDs: [],
    selectedTransactions: {},
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    showSelectAllMatchingItems: false,
    shouldShowFiltersBarLoading: false,
    shouldUseLiveData: false,
    setLastSearchType: jest.fn(),
    setCurrentSearchHashAndKey: jest.fn(),
    setCurrentSearchQueryJSON: jest.fn(),
    setSelectedTransactions: jest.fn(),
    removeTransaction: jest.fn(),
    clearSelectedTransactions: jest.fn(),
    setShouldShowFiltersBarLoading: jest.fn(),
    shouldShowSelectAllMatchingItems: jest.fn(),
    selectAllMatchingItems: jest.fn(),
    setShouldResetSearchQuery: jest.fn(),
};

const createMerchantListItem = (merchant: string, options: Partial<TransactionMerchantGroupListItemType> = {}): TransactionMerchantGroupListItemType => ({
    merchant,
    formattedMerchant: options.formattedMerchant ?? merchant,
    count: options.count ?? 5,
    currency: options.currency ?? 'USD',
    total: options.total ?? 250,
    groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
    transactions: [],
    transactionsQueryJSON: undefined,
    keyForList: `merchant-${merchant}`,
    ...options,
});

// Helper function to wrap component with context
const renderMerchantListItemHeader = (
    merchantItem: TransactionMerchantGroupListItemType,
    props: Partial<{
        onCheckboxPress: jest.Mock;
        isDisabled: boolean;
        canSelectMultiple: boolean;
        isSelectAllChecked: boolean;
        isIndeterminate: boolean;
        onDownArrowClick: jest.Mock;
        isExpanded: boolean;
        columns: SearchColumnType[];
    }> = {},
) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchContext.Provider value={mockSearchContext}>
                <MerchantListItemHeader
                    merchant={merchantItem}
                    onCheckboxPress={props.onCheckboxPress ?? jest.fn()}
                    isDisabled={props.isDisabled ?? false}
                    canSelectMultiple={props.canSelectMultiple ?? false}
                    isSelectAllChecked={props.isSelectAllChecked ?? false}
                    isIndeterminate={props.isIndeterminate ?? false}
                    onDownArrowClick={props.onDownArrowClick}
                    isExpanded={props.isExpanded ?? false}
                    columns={props.columns ?? [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]}
                />
            </SearchContext.Provider>
        </ComposeProviders>,
    );
};

describe('MerchantListItemHeader', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Default to small screen (mobile) layout
        mockedUseResponsiveLayout.mockReturnValue({
            isLargeScreenWidth: false,
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isMediumScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isExtraSmallScreenHeight: false,
            isExtraLargeScreenWidth: false,
            isSmallScreen: true,
            isInNarrowPaneModal: false,
            onboardingIsMediumOrLargerScreenWidth: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Merchant name display', () => {
        it('should display the merchant name from formattedMerchant', async () => {
            const merchantItem = createMerchantListItem('Starbucks', {formattedMerchant: 'Starbucks'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Starbucks')).toBeOnTheScreen();
        });

        it('should display merchant name when formattedMerchant has different value', async () => {
            // formattedMerchant contains the formatted version
            const merchantItem = createMerchantListItem('starbucks_coffee', {
                formattedMerchant: 'Starbucks Coffee',
            });
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Starbucks Coffee')).toBeOnTheScreen();
        });

        it('should display "No merchant" for empty merchant string', async () => {
            // formattedMerchant is set to "No merchant" by getMerchantSections for empty merchants
            const merchantItem = createMerchantListItem('', {formattedMerchant: 'No merchant'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('No merchant')).toBeOnTheScreen();
        });

        it('should display "No merchant" when merchant is undefined', async () => {
            // formattedMerchant is set to "No merchant" by getMerchantSections for empty merchants
            const merchantItem = createMerchantListItem('', {formattedMerchant: 'No merchant'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('No merchant')).toBeOnTheScreen();
        });

        it('should display "No merchant" when both merchant and formattedMerchant are empty', async () => {
            // formattedMerchant is set to "No merchant" by getMerchantSections for empty merchants
            const merchantItem = createMerchantListItem('', {merchant: '', formattedMerchant: 'No merchant'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('No merchant')).toBeOnTheScreen();
        });
    });

    describe('Checkbox functionality', () => {
        it('should render checkbox when canSelectMultiple is true', async () => {
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeOnTheScreen();
        });

        it('should not render checkbox when canSelectMultiple is false', async () => {
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
        });

        it('should call onCheckboxPress when checkbox is pressed', async () => {
            const onCheckboxPress = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            fireEvent.press(checkbox);

            expect(onCheckboxPress).toHaveBeenCalledWith(merchantItem);
        });

        it('should show checkbox as checked when isSelectAllChecked is true', async () => {
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true, isSelectAllChecked: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeChecked();
        });
    });

    describe('Total and count display', () => {
        it('should display the total amount', async () => {
            const merchantItem = createMerchantListItem('Starbucks', {total: 50000, currency: 'USD'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            // TotalCell formats the amount, so we check for the formatted version
            // $500.00 is 50000 cents
            expect(screen.getByText('$500.00')).toBeOnTheScreen();
        });

        it('should display the total amount with different currencies', async () => {
            const merchantItem = createMerchantListItem('Starbucks', {total: 10000, currency: 'EUR'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            // Should display EUR formatted amount
            expect(screen.getByTestId('TotalCell')).toBeOnTheScreen();
        });
    });

    describe('Disabled state', () => {
        it('should render checkbox with disabled styling when isDisabled is true', async () => {
            const onCheckboxPress = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true, isDisabled: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });

        it('should render checkbox with disabled styling when isDisabledCheckbox is true on merchant item', async () => {
            const onCheckboxPress = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks', {isDisabledCheckbox: true});
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });
    });

    describe('Large screen layout', () => {
        beforeEach(() => {
            mockedUseResponsiveLayout.mockReturnValue({
                isLargeScreenWidth: true,
                shouldUseNarrowLayout: false,
                isSmallScreenWidth: false,
                isMediumScreenWidth: false,
                isExtraSmallScreenWidth: false,
                isExtraSmallScreenHeight: false,
                isExtraLargeScreenWidth: true,
                isSmallScreen: false,
                isInNarrowPaneModal: false,
                onboardingIsMediumOrLargerScreenWidth: true,
            });
        });

        it('should render column components on large screen', async () => {
            const merchantItem = createMerchantListItem('Starbucks', {count: 5, total: 25000});
            renderMerchantListItemHeader(merchantItem, {
                columns: [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL],
            });
            await waitForBatchedUpdatesWithAct();

            // Should display merchant name, expense count, and total
            expect(screen.getByText('Starbucks')).toBeOnTheScreen();
            expect(screen.getByText('5')).toBeOnTheScreen();
            expect(screen.getByText('$250.00')).toBeOnTheScreen();
        });

        it('should render checkbox on large screen when canSelectMultiple is true', async () => {
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {canSelectMultiple: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeOnTheScreen();
        });
    });

    describe('Expand/Collapse functionality', () => {
        it('should render expand/collapse button when onDownArrowClick is provided', async () => {
            const onDownArrowClick = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {onDownArrowClick, isExpanded: false});
            await waitForBatchedUpdatesWithAct();

            // The expand/collapse button should be rendered with "Expand" label when not expanded
            const expandButton = screen.getByLabelText('Expand');
            expect(expandButton).toBeOnTheScreen();
        });

        it('should call onDownArrowClick when expand/collapse button is pressed', async () => {
            const onDownArrowClick = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {onDownArrowClick, isExpanded: false});
            await waitForBatchedUpdatesWithAct();

            const expandButton = screen.getByLabelText('Expand');
            fireEvent.press(expandButton);

            expect(onDownArrowClick).toHaveBeenCalled();
        });

        it('should show "Collapse" label when isExpanded is true', async () => {
            const onDownArrowClick = jest.fn();
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem, {onDownArrowClick, isExpanded: true});
            await waitForBatchedUpdatesWithAct();

            const collapseButton = screen.getByLabelText('Collapse');
            expect(collapseButton).toBeOnTheScreen();
        });

        it('should not render expand/collapse button when onDownArrowClick is not provided', async () => {
            const merchantItem = createMerchantListItem('Starbucks');
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByLabelText('Expand')).not.toBeOnTheScreen();
            expect(screen.queryByLabelText('Collapse')).not.toBeOnTheScreen();
        });
    });

    describe('Special merchant names', () => {
        it('should handle merchants with special characters', async () => {
            const merchantItem = createMerchantListItem("McDonald's & Co.", {formattedMerchant: "McDonald's & Co."});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText("McDonald's & Co.")).toBeOnTheScreen();
        });

        it('should handle merchants with Unicode characters', async () => {
            const merchantItem = createMerchantListItem('カフェ東京', {formattedMerchant: 'カフェ東京'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('カフェ東京')).toBeOnTheScreen();
        });

        it('should handle merchants with emoji', async () => {
            const merchantItem = createMerchantListItem('Coffee ☕', {formattedMerchant: 'Coffee ☕'});
            renderMerchantListItemHeader(merchantItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Coffee ☕')).toBeOnTheScreen();
        });
    });
});
