import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import AmountInputField from '@components/ReportActionItem/MoneyRequestViewFields/AmountInputField';
import DescriptionInputField from '@components/ReportActionItem/MoneyRequestViewFields/DescriptionInputField';
import MerchantInputField from '@components/ReportActionItem/MoneyRequestViewFields/MerchantInputField';
import TaxAmountInputField from '@components/ReportActionItem/MoneyRequestViewFields/TaxAmountInputField';

import type {DuplicateTransactionsAndViolations} from '@hooks/useDuplicateTransactionsAndViolations';
import useMoneyRequestUpdateParams from '@hooks/useMoneyRequestUpdateParams';
import type {MoneyRequestUpdateParams} from '@hooks/useMoneyRequestUpdateParams';
import useUpdateTransactionDate from '@hooks/useUpdateTransactionDate';

import {
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestDate,
    updateMoneyRequestDescription,
    updateMoneyRequestMerchant,
    updateMoneyRequestTaxAmount,
} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Only what each field asks to be saved matters here, so the writes are stubbed to record it.
jest.mock('@userActions/IOU/UpdateMoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/UpdateMoneyRequest'),
    updateMoneyRequestMerchant: jest.fn(),
    updateMoneyRequestDescription: jest.fn(),
    updateMoneyRequestAmountAndCurrency: jest.fn(),
    updateMoneyRequestDate: jest.fn(),
    updateMoneyRequestTaxAmount: jest.fn(),
}));
// The amount input asks the navigator whether its screen is focused, and these fields render outside one.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        getCurrencyDecimals: jest.fn(() => 2),
        getCurrencySymbol: jest.fn(() => '$'),
        convertToDisplayString: jest.fn((amountInCents = 0) => `USD ${(amountInCents / 100).toFixed(2)}`),
    })),
}));

const TRANSACTION_ID = 'transaction1';
const EXPENSE_REPORT_ID = 'expenseReport1';
const THREAD_REPORT_ID = 'thread1';
const POLICY_ID = 'policy1';
const TAX_CODE = 'id_TAX_10';

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

// The expense has no duplicates, so a save has none of their violations to recompute.
const NO_DUPLICATES: DuplicateTransactionsAndViolations = {duplicateTransactions: {}, duplicateTransactionViolations: {}};

function Providers({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>{children}</ComposeProviders>;
}

const renderField = (field: React.ReactElement) => render(<Providers>{field}</Providers>);

describe('saved expense inline fields', () => {
    // What each field saves with, read the way the expense view reads it and hands it down
    let updateParams: MoneyRequestUpdateParams;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, expenseReport);
        await waitForBatchedUpdatesWithAct();
        const {result} = renderHook(() => useMoneyRequestUpdateParams(TRANSACTION_ID, threadReport), {wrapper: Providers});
        await waitForBatchedUpdatesWithAct();
        updateParams = result.current;
    });

    describe('MerchantInputField', () => {
        const renderMerchant = (errorText?: string) =>
            renderField(
                <MerchantInputField
                    transaction={transaction}
                    updateParams={updateParams}
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

        it('strips invisible characters from the typed merchant before saving it', async () => {
            // Given a saved expense whose merchant is shown in the input
            renderMerchant();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Merchant');

            // When a merchant pasted with zero-width spaces around it is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '\u200BTea House\u200B');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then only the visible merchant is saved, as the merchant page would save it
            expect(updateMoneyRequestMerchant).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestMerchant).toHaveBeenCalledWith(expect.objectContaining({value: 'Tea House'}));
        });

        it('does not save a merchant that did not change', async () => {
            // Given a saved expense whose merchant is shown in the input
            renderMerchant();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Merchant');

            // When only a trailing space is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, 'Coffee Shop ');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent, so no pointless edit shows up on the expense
            expect(updateMoneyRequestMerchant).not.toHaveBeenCalled();
        });

        it('does not write the old merchant back when it changed while the untouched input was focused', async () => {
            // Given the merchant input focused but not typed in
            const {rerender} = renderMerchant();
            await waitForBatchedUpdatesWithAct();
            fireEvent(screen.getByLabelText('Merchant'), 'focus');

            // When the merchant is changed elsewhere, such as on another device, and the input is then left
            rerender(
                <Providers>
                    <MerchantInputField
                        transaction={{...transaction, merchant: 'Tea House'}}
                        updateParams={updateParams}
                    />
                </Providers>,
            );
            fireEvent(screen.getByLabelText('Merchant'), 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the input shows the new merchant and saves nothing, rather than overwriting it with the stale one
            expect(screen.getByLabelText('Merchant').props.value).toBe('Tea House');
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
                    updateParams={updateParams}
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

        it('does not save a description whose saved HTML ends in a line break when the input is only focused', async () => {
            // Given a saved description stored as HTML with a trailing line break, which reads back as markdown with a
            // trailing newline that trimming would turn into a change
            renderField(
                <DescriptionInputField
                    transaction={{...transaction, comment: {comment: 'Team lunch<br />'}}}
                    updateParams={updateParams}
                    isReportInGroupPolicy
                />,
            );
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Description');

            // When the input is focused and left without typing
            fireEvent(input, 'focus');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent, as the user changed nothing
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
    describe('AmountInputField', () => {
        const policy: Policy = {
            id: POLICY_ID,
            name: 'Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
        };
        const renderAmount = (amount = 5000) =>
            renderField(
                <AmountInputField
                    transaction={transaction}
                    updateParams={updateParams}
                    duplicates={NO_DUPLICATES}
                    policy={policy}
                    policyCategories={undefined}
                    amount={amount}
                    currency={CONST.CURRENCY.USD}
                    label="Amount"
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    allowNegative={false}
                    isP2P
                    isCurrencyEditable
                />,
            );

        it('saves the typed amount when the input loses focus', async () => {
            // Given a saved expense whose amount is shown in the input
            renderAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Amount');
            expect(input.props.value).toBe('50.00');

            // When a new amount is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '72.5');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the amount is saved to that expense in the smallest currency unit, with its currency unchanged
            expect(updateMoneyRequestAmountAndCurrency).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestAmountAndCurrency).toHaveBeenCalledWith(
                expect.objectContaining({transactionID: TRANSACTION_ID, amount: 7250, currency: CONST.CURRENCY.USD, transactionThreadReport: threadReport}),
            );
        });

        it('does not save an amount that is worth the same as the saved one', async () => {
            // Given a saved expense whose amount is shown in the input
            renderAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Amount');

            // When the same amount is typed without its trailing zeros and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '50');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent, and the input goes back to showing the amount the way the expense holds it
            expect(updateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
            expect(screen.getByLabelText('Amount').props.value).toBe('50.00');
        });

        it('brings the saved amount back when the input is cleared', async () => {
            // Given a saved expense whose amount is shown in the input
            renderAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Amount');

            // When the amount is deleted and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent and the saved amount shows again, since an expense always has an amount
            expect(updateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
            expect(screen.getByLabelText('Amount').props.value).toBe('50.00');
        });

        it('shows an error instead of saving an amount the amount page would reject', async () => {
            // Given a saved expense between two people, which cannot be for nothing
            renderAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Amount');

            // When zero is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '0');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the field reports it under the input and the expense keeps its amount
            expect(screen.getByText('Please enter a valid amount before continuing')).toBeOnTheScreen();
            expect(updateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
        });
    });

    describe('TaxAmountInputField', () => {
        // A 10% tax included in a 55.00 expense works out to 5.00, which is the most the tax amount can be
        const taxPolicy: Policy = {
            id: POLICY_ID,
            name: 'Workspace',
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            taxRates: {name: 'Tax', defaultExternalID: TAX_CODE, defaultValue: '10%', foreignTaxDefault: TAX_CODE, taxes: {[TAX_CODE]: {name: 'VAT', value: '10%'}}},
        };
        const taxedTransaction: Transaction = {...transaction, amount: 5500, taxCode: TAX_CODE, taxAmount: 300};
        const renderTaxAmount = () =>
            renderField(
                <TaxAmountInputField
                    transaction={taxedTransaction}
                    updateParams={updateParams}
                    policy={taxPolicy}
                    taxAmount={300}
                    currency={CONST.CURRENCY.USD}
                    label="Tax amount"
                />,
            );

        it('saves the typed tax amount when the input loses focus', async () => {
            // Given a saved expense whose tax amount is shown in the input
            renderTaxAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Tax amount');
            expect(input.props.value).toBe('3.00');

            // When a new tax amount within what the tax rate allows is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '4.5');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then it is saved to that expense in the smallest currency unit, as the tax amount page would save it
            expect(updateMoneyRequestTaxAmount).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestTaxAmount).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRANSACTION_ID, taxAmount: 450, transactionThreadReport: threadReport}));
        });

        it('shows an error instead of saving a tax amount above what the tax rate works out to', async () => {
            // Given a saved expense whose tax rate allows at most 5.00 of tax
            renderTaxAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Tax amount');

            // When a larger tax amount is typed and the input is left
            fireEvent(input, 'focus');
            fireEvent.changeText(input, '9');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then the field reports the limit under the input, as the tax amount page does, and nothing is saved
            expect(screen.getByText(/maximum tax amount/i)).toBeOnTheScreen();
            expect(updateMoneyRequestTaxAmount).not.toHaveBeenCalled();
        });

        it('does not save when the input is left without a change', async () => {
            // Given a saved expense whose tax amount is shown in the input
            renderTaxAmount();
            await waitForBatchedUpdatesWithAct();
            const input = screen.getByLabelText('Tax amount');

            // When the input is focused and left without typing
            fireEvent(input, 'focus');
            fireEvent(input, 'blur');
            await waitForBatchedUpdatesWithAct();

            // Then nothing is sent, so no pointless edit shows up on the expense
            expect(updateMoneyRequestTaxAmount).not.toHaveBeenCalled();
        });
    });

    describe('useUpdateTransactionDate', () => {
        it('saves the picked date to the saved expense', async () => {
            // Given the save hook for a reported expense
            const {result} = renderHook(
                () => useUpdateTransactionDate({transaction, updateParams: useMoneyRequestUpdateParams(TRANSACTION_ID, threadReport), duplicates: NO_DUPLICATES, isTrackExpense: false}),
                {
                    wrapper: Providers,
                },
            );
            await waitForBatchedUpdatesWithAct();

            // When a date is saved through it
            act(() => result.current.updateDate('2025-07-15'));

            // Then the date is written to that expense with its parent report, which the write needs to recompute violations
            expect(updateMoneyRequestDate).toHaveBeenCalledTimes(1);
            expect(updateMoneyRequestDate).toHaveBeenCalledWith(
                expect.objectContaining({transactionID: TRANSACTION_ID, value: '2025-07-15', transactionThreadReport: threadReport, parentReport: expenseReport}),
            );
        });
    });
});
