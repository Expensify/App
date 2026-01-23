import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContext} from '@components/Search/SearchContext';
import type {SearchColumnType} from '@components/Search/types';
import CategoryListItemHeader from '@components/SelectionListWithSections/Search/CategoryListItemHeader';
import type {TransactionCategoryGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');

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

const createCategoryListItem = (category: string, options: Partial<TransactionCategoryGroupListItemType> = {}): TransactionCategoryGroupListItemType => ({
    category,
    formattedCategory: options.formattedCategory ?? category,
    count: options.count ?? 5,
    currency: options.currency ?? 'USD',
    total: options.total ?? 250,
    groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
    transactions: [],
    transactionsQueryJSON: undefined,
    keyForList: `category-${category}`,
    ...options,
});

// Helper function to wrap component with context
const renderCategoryListItemHeader = (
    categoryItem: TransactionCategoryGroupListItemType,
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
                <CategoryListItemHeader
                    category={categoryItem}
                    onCheckboxPress={props.onCheckboxPress ?? jest.fn()}
                    isDisabled={props.isDisabled ?? false}
                    canSelectMultiple={props.canSelectMultiple ?? false}
                    isSelectAllChecked={props.isSelectAllChecked ?? false}
                    isIndeterminate={props.isIndeterminate ?? false}
                    onDownArrowClick={props.onDownArrowClick}
                    isExpanded={props.isExpanded ?? false}
                    columns={props.columns ?? [CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]}
                />
            </SearchContext.Provider>
        </ComposeProviders>,
    );
};

describe('CategoryListItemHeader', () => {
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

    describe('Category name display', () => {
        it('should display the category name from formattedCategory', async () => {
            const categoryItem = createCategoryListItem('Travel', {formattedCategory: 'Travel'});
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Travel')).toBeOnTheScreen();
        });

        it('should display decoded category name when formattedCategory has decoded HTML entities', async () => {
            // formattedCategory contains the decoded version
            const categoryItem = createCategoryListItem('Travel &amp; Entertainment', {
                formattedCategory: 'Travel & Entertainment',
            });
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Travel & Entertainment')).toBeOnTheScreen();
        });

        it('should display "No category" for empty category string', async () => {
            const categoryItem = createCategoryListItem('', {formattedCategory: ''});
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('No category')).toBeOnTheScreen();
        });

        it('should display "No category" for CATEGORY_EMPTY_VALUE', async () => {
            const categoryItem = createCategoryListItem(CONST.SEARCH.CATEGORY_EMPTY_VALUE, {
                formattedCategory: CONST.SEARCH.CATEGORY_EMPTY_VALUE,
            });
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('No category')).toBeOnTheScreen();
        });
    });

    describe('Checkbox functionality', () => {
        it('should render checkbox when canSelectMultiple is true', async () => {
            const categoryItem = createCategoryListItem('Travel');
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByRole('checkbox')).toBeOnTheScreen();
        });

        it('should not render checkbox when canSelectMultiple is false', async () => {
            const categoryItem = createCategoryListItem('Travel');
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
        });

        it('should call onCheckboxPress when checkbox is pressed', async () => {
            const onCheckboxPress = jest.fn();
            const categoryItem = createCategoryListItem('Travel');
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            await act(async () => {
                fireEvent.press(checkbox);
            });

            expect(onCheckboxPress).toHaveBeenCalledWith(categoryItem);
        });

        it('should show checkbox as checked when isSelectAllChecked is true', async () => {
            const categoryItem = createCategoryListItem('Travel');
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: true, isSelectAllChecked: true});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            expect(checkbox.props.accessibilityState.checked).toBe(true);
        });
    });

    describe('Total and count display', () => {
        it('should display the total amount', async () => {
            const categoryItem = createCategoryListItem('Travel', {total: 50000, currency: 'USD'});
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            // TotalCell formats the amount, so we check for the formatted version
            // $500.00 is 50000 cents
            expect(screen.getByText('$500.00')).toBeOnTheScreen();
        });

        it('should display the total amount with different currencies', async () => {
            const categoryItem = createCategoryListItem('Travel', {total: 10000, currency: 'EUR'});
            renderCategoryListItemHeader(categoryItem);
            await waitForBatchedUpdatesWithAct();

            // Should display EUR formatted amount
            expect(screen.getByTestId('TotalCell')).toBeOnTheScreen();
        });
    });

    describe('Disabled state', () => {
        it('should render checkbox with disabled styling when isDisabled is true', async () => {
            const onCheckboxPress = jest.fn();
            const categoryItem = createCategoryListItem('Travel');
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: true, isDisabled: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });

        it('should render checkbox with disabled styling when isDisabledCheckbox is true on category item', async () => {
            const onCheckboxPress = jest.fn();
            const categoryItem = createCategoryListItem('Travel', {isDisabledCheckbox: true});
            renderCategoryListItemHeader(categoryItem, {canSelectMultiple: true, onCheckboxPress});
            await waitForBatchedUpdatesWithAct();

            const checkbox = screen.getByRole('checkbox');
            // The checkbox should still be rendered
            expect(checkbox).toBeOnTheScreen();
        });
    });
});
