import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchColumnType} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useAnimatedHighlightStyle');

const SCANNING_TEXT = 'Scanning…';
const FORMATTED_CREATED_DATE = 'Oct 1, 2023';

const defaultProps = {
    isSelected: false,
    shouldShowTooltip: false,
    dateColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    amountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    taxAmountColumnSize: CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
    onCheckboxPress: jest.fn(),
    shouldShowCheckbox: false,
    onButtonPress: jest.fn(),
};

const dateOnlyColumns: SearchColumnType[] = [CONST.SEARCH.TABLE_COLUMNS.DATE];

function createTransaction(overrides: Partial<Transaction>): Transaction {
    return {
        ...createRandomTransaction(1),
        pendingAction: null,
        created: '2023-10-01',
        modifiedCreated: '',
        category: '',
        ...overrides,
    };
}

function createScanningTransaction(): Transaction {
    return createTransaction({
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        modifiedMerchant: '',
        amount: 0,
        modifiedAmount: '',
        receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
    });
}

function createCompletedTransaction(): Transaction {
    return createTransaction({
        merchant: 'Test Merchant',
        modifiedMerchant: '',
        receipt: {filename: 'receipt.jpg'},
    });
}

function createScanningTransactionWithCategory(category: string): Transaction {
    return createTransaction({
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        modifiedMerchant: '',
        amount: 0,
        modifiedAmount: '',
        category,
        receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
    });
}

function renderTransactionItemRow(transactionItem: Transaction, shouldUseNarrowLayout: boolean, columns: SearchColumnType[]) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <TransactionItemRow
                transactionItem={transactionItem}
                violations={undefined}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                columns={columns}
                {...defaultProps}
            />
        </ComposeProviders>,
    );
}

describe('TransactionItemRow scanning date', () => {
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

    it('shows Scanning in the date column while the receipt is being scanned on the wide layout', async () => {
        renderTransactionItemRow(createScanningTransaction(), false, dateOnlyColumns);
        await waitForBatchedUpdates();

        expect(screen.getByText(SCANNING_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(FORMATTED_CREATED_DATE)).not.toBeOnTheScreen();
    });

    it('shows the formatted date in the date column when the receipt is not being scanned on the wide layout', async () => {
        renderTransactionItemRow(createCompletedTransaction(), false, dateOnlyColumns);
        await waitForBatchedUpdates();

        expect(screen.getByText(FORMATTED_CREATED_DATE)).toBeOnTheScreen();
        expect(screen.queryByText(SCANNING_TEXT)).not.toBeOnTheScreen();
    });

    it('shows Scanning in place of the date while the receipt is being scanned on the narrow layout', async () => {
        renderTransactionItemRow(createScanningTransaction(), true, dateOnlyColumns);
        await waitForBatchedUpdates();

        // Several narrow cells (merchant, total) already show the scanning state — the date cell is fixed
        // when the formatted date no longer renders alongside them
        expect(screen.getAllByText(SCANNING_TEXT).length).toBeGreaterThan(1);
        expect(screen.queryByText(FORMATTED_CREATED_DATE)).not.toBeOnTheScreen();
    });

    it('keeps the category suffix alongside Scanning… in the date cell on the narrow layout', async () => {
        renderTransactionItemRow(createScanningTransactionWithCategory('Office Supplies'), true, dateOnlyColumns);
        await waitForBatchedUpdates();

        // On narrow layout the category renders only as the date-cell suffix, so the scanning override must keep it.
        expect(screen.getByText('Scanning… • Office Supplies')).toBeOnTheScreen();
    });

    it('shows the formatted date when the receipt is not being scanned on the narrow layout', async () => {
        renderTransactionItemRow(createCompletedTransaction(), true, dateOnlyColumns);
        await waitForBatchedUpdates();

        expect(screen.getByText(FORMATTED_CREATED_DATE)).toBeOnTheScreen();
        expect(screen.queryByText(SCANNING_TEXT)).not.toBeOnTheScreen();
    });
});
