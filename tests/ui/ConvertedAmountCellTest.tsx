import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ConvertedAmountCell from '@components/TransactionItemRow/DataCells/ConvertedAmountCell';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency ?? 'USD'} ${((amount ?? 0) / 100).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

const createBaseTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    ...createRandomTransaction(1),
    transactionID: 'converted-amount-cell-transaction',
    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
    amount: -10000,
    currency: CONST.CURRENCY.EUR,
    modifiedAmount: undefined,
    modifiedCurrency: undefined,
    iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
    ...overrides,
});

const renderConvertedAmountCell = (transactionItem: Transaction) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ConvertedAmountCell transactionItem={transactionItem} />
        </ComposeProviders>,
    );

describe('ConvertedAmountCell', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    it('shows the workspace amount in the workspace currency', async () => {
        // Given a EUR expense that Search returned with its amount converted to USD
        const transaction = createBaseTransaction({policyConvertedAmount: -12000, policyCurrency: CONST.CURRENCY.USD});

        // When the cell renders it
        renderConvertedAmountCell(transaction);
        await waitForBatchedUpdates();

        // Then the cell shows the USD amount, because the column shows each expense in its workspace's currency
        expect(screen.getByText('USD 120.00')).toBeOnTheScreen();
    });

    it('shows the expense amount in its own currency when there is no workspace amount', async () => {
        // Given a EUR expense that Search has not converted yet, such as one created offline
        const transaction = createBaseTransaction({policyCurrency: CONST.CURRENCY.USD});

        // When the cell renders it
        renderConvertedAmountCell(transaction);
        await waitForBatchedUpdates();

        // Then the cell shows the EUR amount, because a USD label on the EUR amount would be wrong
        expect(screen.getByText('EUR 100.00')).toBeOnTheScreen();
    });

    it('hides the placeholder amount of a failed scan', async () => {
        // Given a failed scan, which leaves a zero placeholder amount
        const transaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        // When the cell renders it
        renderConvertedAmountCell(transaction);
        await waitForBatchedUpdates();

        // Then the cell is empty, the same as the Amount column
        expect(screen.queryByTestId('TotalCell')).not.toBeOnTheScreen();
    });
});
