import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import DescriptionInputField from '@components/ReportActionItem/MoneyRequestViewFields/DescriptionInputField';
import MerchantInputField from '@components/ReportActionItem/MoneyRequestViewFields/MerchantInputField';

import {updateMoneyRequestDescription, updateMoneyRequestMerchant} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Only what each field asks to be saved matters here, so the writes are stubbed to record it.
jest.mock('@userActions/IOU/UpdateMoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/UpdateMoneyRequest'),
    updateMoneyRequestMerchant: jest.fn(),
    updateMoneyRequestDescription: jest.fn(),
}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));

const TRANSACTION_ID = 'transaction1';
const EXPENSE_REPORT_ID = 'expenseReport1';
const THREAD_REPORT_ID = 'thread1';
const POLICY_ID = 'policy1';

const transaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: EXPENSE_REPORT_ID,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    created: '2025-06-01',
    merchant: 'Coffee Shop',
    comment: {comment: 'Team lunch'},
};
const expenseReport: Report = {reportID: EXPENSE_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: POLICY_ID};
const threadReport: Report = {reportID: THREAD_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: EXPENSE_REPORT_ID, parentReportActionID: 'action1', policyID: POLICY_ID};

const renderField = (field: React.ReactElement) =>
    render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{field}</ComposeProviders>);

describe('saved expense inline fields', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, expenseReport);
        await waitForBatchedUpdatesWithAct();
    });

    describe('MerchantInputField', () => {
        const renderMerchant = (errorText?: string) =>
            renderField(
                <MerchantInputField
                    transaction={transaction}
                    transactionThreadReport={threadReport}
                    errorText={errorText}
                />,
            );

        it('saves the typed merchant when the input loses focus', async () => {
            // Given a saved expense whose merchant is shown in the input
            renderMerchant();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Merchant');
            expect(input.props.value).toBe('Coffee Shop');

            // When a new merchant is typed with spaces around it and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '  Tea House  ');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the trimmed merchant is saved to that expense, as the merchant page would save it
            expect(updateMoneyRequestMerchant).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, value: 'Tea House', transactionThreadReport: threadReport}));
        });

        it('does not save a merchant that did not change', async () => {
            // Given a saved expense whose merchant is shown in the input
            renderMerchant();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Merchant');

            // When the input is focused and left without a real change
            fireEvent(input, 'focus');
            fireEvent.changeText(input, 'Coffee Shop ');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent, so no pointless edit shows up on the expense
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('shows an error instead of saving a merchant the merchant page would reject', async () => {
            // Given a saved expense whose merchant is shown in the input
            renderMerchant();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Merchant');

            // When the placeholder for a missing merchant is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the field reports it under the input and the expense keeps its merchant
            expect(screen.getByText('Please enter a valid merchant')).toBeOnTheScreen();
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('shows the violation it is handed while the typed value is fine', async () => {
            // Given a saved expense with a merchant violation
            // When the field renders
            renderMerchant('Merchant is missing');
            await waitForBatchedUpdatesWithAct();

            // Then the violation shows under the input
            expect(screen.getByText('Merchant is missing')).toBeOnTheScreen();
        });
    });

    describe('DescriptionInputField', () => {
        const renderDescription = () =>
            renderField(
                <DescriptionInputField
                    transaction={transaction}
                    transactionThreadReport={threadReport}
                    isReportInGroupPolicy
                />,
            );

        it('saves the typed description when the input loses focus', async () => {
            // Given a saved expense whose description is shown in the input
            renderDescription();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Description');
            expect(input.props.value).toBe('Team lunch');

            // When a new description is typed with spaces around it and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, ' Client dinner ');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the trimmed description is saved to that expense, as the description page would save it
            expect(updateMoneyRequestDescription).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestDescription).toHaveBeenCalledWith(
                expect.objectContaining({transactionID: TRANSACTION_ID, comment: 'Client dinner', transactionThreadReport: threadReport}),
            );
        });

        it('does not save a description that did not change', async () => {
            // Given a saved expense whose description is shown in the input
            renderDescription();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Description');

            // When the input is focused and left as it was
            fireEvent(input, 'focus');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent
            expect(updateMoneyRequestDescription).not.toHaveBeenCalled();
        });

        it('shows an error instead of saving a description over the length limit', async () => {
            // Given a saved expense whose description is shown in the input
            renderDescription();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Description');

            // When a description longer than the limit is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, 'a'.repeat(CONST.DESCRIPTION_LIMIT + 1));
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the field reports it under the input and the expense keeps its description
            expect(screen.getByText(/Character limit exceeded/)).toBeOnTheScreen();
            expect(updateMoneyRequestDescription).not.toHaveBeenCalled();
        });
    });
});
