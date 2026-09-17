import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestReportTransactionItem from '@components/MoneyRequestReportView/MoneyRequestReportTransactionItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native');

const REPORT_ID = '12345';
const TRANSACTION_ID = '67890';
const ERROR_TIMESTAMP = '1770000000000000';

// The exact copy Web-Expensify returns for this case (Web-Expensify/lib/ReportAPI.php). It is English-only,
// so it must never reach the screen.
const SERVER_REJECT_MESSAGE = 'The expense has already been moved or rejected.';

const report: Report = {
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    reportName: 'Test report',
};

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(0),
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        merchant: 'Test Merchant',
        ...overrides,
    };
}

/** A transaction the server reported as already moved, which lands under its own `reject` error field. */
function buildTransactionWithRejectError(): Transaction {
    return buildTransaction({errorFields: {reject: {[ERROR_TIMESTAMP]: SERVER_REJECT_MESSAGE}}});
}

describe('MoneyRequestReportTransactionItem - reject errors', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        await waitForBatchedUpdatesWithAct();
    });

    async function renderTransactionItem(transaction: Transaction, handleOnPress = jest.fn()) {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <ScreenWrapper testID="test">
                    <PortalProvider>
                        <MoneyRequestReportTransactionItem
                            transaction={transaction}
                            violations={[]}
                            report={report}
                            policy={undefined}
                            isSelectionModeEnabled={false}
                            toggleTransaction={jest.fn()}
                            handleOnPress={handleOnPress}
                            handleLongPress={jest.fn()}
                            isSelected={false}
                            dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            postedColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            columns={[CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]}
                            shouldBeHighlighted={false}
                            nonPersonalAndWorkspaceCards={{}}
                        />
                    </PortalProvider>
                </ScreenWrapper>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        return {handleOnPress};
    }

    it('should show the translated copy instead of the English message the server sent', async () => {
        // Given: An expense the server refused to reject because it had already moved
        await renderTransactionItem(buildTransactionWithRejectError());

        // Then: The user sees the app's own copy, not the untranslatable server string
        expect(screen.getByText(translateLocal('iou.rejectReport.couldNotRejectExpense'))).toBeOnTheScreen();
        expect(screen.queryByText(SERVER_REJECT_MESSAGE)).not.toBeOnTheScreen();
    });

    it('should show the reject error once, not again inside the row', async () => {
        // Given: An expense the server refused to reject
        await renderTransactionItem(buildTransactionWithRejectError());

        // Then: Only the dismissible message is shown, so the row itself carries no duplicate of it
        expect(screen.getAllByText(translateLocal('iou.rejectReport.couldNotRejectExpense'))).toHaveLength(1);
        expect(screen.queryByTestId('TransactionItemRowRBR')).not.toBeOnTheScreen();
    });

    it('should not let the expense be opened while it carries a reject error', async () => {
        // Given: An expense showing a reject error, so the server no longer has it on this report
        await renderTransactionItem(buildTransactionWithRejectError());

        // Then: The row cannot be opened, because the RHP would immediately dismiss itself
        expect(screen.getByLabelText('View details')).toBeDisabled();
    });

    it('should still open an expense that has no reject error', async () => {
        // Given: An ordinary expense
        const {handleOnPress} = await renderTransactionItem(buildTransaction());

        // When: The user presses the row
        expect(screen.getByLabelText('View details')).toBeEnabled();
        fireEvent.press(screen.getByLabelText('View details'));
        await waitForBatchedUpdatesWithAct();

        // Then: The expense opens as usual
        expect(handleOnPress).toHaveBeenCalledWith(TRANSACTION_ID);
    });

    it('should drop the stale expense when the reject error is dismissed', async () => {
        // Given: An expense left behind by a reject the server refused
        await renderTransactionItem(buildTransactionWithRejectError());

        // When: The user dismisses the error
        fireEvent.press(screen.getByLabelText('Dismiss'));
        await waitForBatchedUpdatesWithAct();

        // Then: The stale local copy is gone, so it stops showing on a report it is no longer on
        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transaction).toBeFalsy();
    });
});
