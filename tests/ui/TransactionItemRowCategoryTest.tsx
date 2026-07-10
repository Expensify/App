import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchColumnType} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');

const MOCK_TRANSACTION_ID = '1';
const MOCK_REPORT_ID = '1';
const HIERARCHICAL_CATEGORY = 'Meals and Entertainment: Other';

// Default props for TransactionItemRow component
const defaultProps = {
    shouldUseNarrowLayout: false,
    isSelected: false,
    shouldShowTooltip: false,
    dateColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    amountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    taxAmountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    onCheckboxPress: jest.fn(),
    shouldShowCheckbox: false,
    columns: Object.values(CONST.SEARCH.TABLE_COLUMNS) as SearchColumnType[],
    onButtonPress: jest.fn(),
    isParentHovered: false,
};

// Helper function to render TransactionItemRow with providers
const renderTransactionItemRow = (transactionItem: TransactionWithOptionalSearchFields, shouldUseNarrowLayout: boolean) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <TransactionItemRow
                transactionItem={transactionItem}
                violations={undefined}
                {...defaultProps}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
            />
        </ComposeProviders>,
    );
};

// Helper function to create a transaction with a hierarchical category
const createCategorizedTransaction = (category: string) => ({
    ...createRandomTransaction(1),
    pendingAction: null,
    transactionID: MOCK_TRANSACTION_ID,
    reportID: MOCK_REPORT_ID,
    category,
});

describe('TransactionItemRow category display', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        return Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
    });

    it('should display the full category hierarchy in the wide layout category cell', async () => {
        // Given a transaction with a hierarchical category
        const mockTransaction = createCategorizedTransaction(HIERARCHICAL_CATEGORY);

        // When rendering the transaction item row in the wide layout
        renderTransactionItemRow(mockTransaction, false);
        await waitForBatchedUpdates();

        // Then the full Parent: Child path should be displayed, not only the leaf
        expect(screen.getByText(HIERARCHICAL_CATEGORY)).toBeOnTheScreen();
    });

    it('should display the full category hierarchy in the narrow layout', async () => {
        // Given a transaction with a hierarchical category
        const mockTransaction = createCategorizedTransaction(HIERARCHICAL_CATEGORY);

        // When rendering the transaction item row in the narrow layout
        renderTransactionItemRow(mockTransaction, true);
        await waitForBatchedUpdates();

        // Then the full Parent: Child path should be displayed as the date suffix, not only the leaf
        expect(screen.getByText(new RegExp(`• ${HIERARCHICAL_CATEGORY}`))).toBeOnTheScreen();
    });

    it('should normalize separator spacing when displaying the category in the wide layout', async () => {
        // Given a transaction whose stored category has no space after the separator
        const mockTransaction = createCategorizedTransaction('A:B');

        // When rendering the transaction item row in the wide layout
        renderTransactionItemRow(mockTransaction, false);
        await waitForBatchedUpdates();

        // Then the category should render in the readable `A: B` form
        expect(screen.getByText('A: B')).toBeOnTheScreen();
    });

    it('should normalize separator spacing when displaying the category in the narrow layout', async () => {
        // Given a transaction whose stored category has no space after the separator
        const mockTransaction = createCategorizedTransaction('A:B');

        // When rendering the transaction item row in the narrow layout
        renderTransactionItemRow(mockTransaction, true);
        await waitForBatchedUpdates();

        // Then the date suffix should render the category in the readable `A: B` form
        expect(screen.getByText(/• A: B/)).toBeOnTheScreen();
    });
});
