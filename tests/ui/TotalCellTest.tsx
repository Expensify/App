import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        convertToDisplayString: (amount?: number, currency?: string) => `${currency === 'USD' ? '$' : `${currency ?? 'USD'} `}${((amount ?? 0) / 100).toFixed(2)}`,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    }),
}));

const MOCK_TRANSACTION_ID = '1';

const createBaseTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    ...createRandomTransaction(1),
    transactionID: MOCK_TRANSACTION_ID,
    currency: CONST.CURRENCY.USD,
    modifiedAmount: undefined,
    ...overrides,
});

const renderTotalCell = (transactionItem: Transaction) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <TotalCell
                transactionItem={transactionItem}
                shouldShowTooltip={false}
                canEdit
                onSave={jest.fn()}
            />
        </ComposeProviders>,
    );
};

describe('TotalCell', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    it('blanks the amount for a failed-scan amount placeholder', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.queryByText('$0.00')).not.toBeOnTheScreen();
    });

    it('shows the formatted amount for a normal transaction', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 1000,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$10.00')).toBeOnTheScreen();
    });

    it('does not blank a legitimate manual $0.00 amount', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$0.00')).toBeOnTheScreen();
    });

    it('does not blank the amount once the failed-scan placeholder amount is confirmed', async () => {
        const mockTransaction = createBaseTransaction({
            amount: 0,
            modifiedAmount: 0,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
        });

        renderTotalCell(mockTransaction);
        await waitForBatchedUpdates();

        expect(screen.getByText('$0.00')).toBeOnTheScreen();
    });
});
