import {render} from '@testing-library/react-native';

import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MoneyRequestViewAdditionalField from '@components/ReportActionItem/MoneyRequestViewAdditionalField';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: (amount: number, currency: string) => `${currency}:${amount}`}),
}));

const attendeesEnabledPolicy = createMock<Policy>({id: 'policy-1', type: CONST.POLICY.TYPE.CORPORATE, isAttendeeTrackingEnabled: true});

function renderField(
    column: SearchColumnType,
    overrides: Partial<Transaction> = {},
    {policy, attendeeCount}: {policy: Policy | undefined; attendeeCount: number} = {policy: attendeesEnabledPolicy, attendeeCount: 2},
) {
    render(
        <MoneyRequestViewAdditionalField
            column={column}
            transaction={{transactionID: '1', reportID: '2', amount: -1000, currency: 'EUR', created: '2026-09-01', merchant: 'Merchant', ...overrides}}
            report={{reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, currency: 'USD', submitterPayrollID: 'payroll-123'}}
            policy={policy}
            policyCategories={undefined}
            policyTagLists={undefined}
            attendeeCount={attendeeCount}
        />,
    );
    return jest.mocked(MenuItemWithTopDescription).mock.calls.at(-1)?.at(0);
}

describe('additional expense field values', () => {
    it.each([
        ['Collect', createMock<Policy>({id: 'policy-1', type: CONST.POLICY.TYPE.TEAM}), 1],
        ['Control with tracking disabled', {...attendeesEnabledPolicy, isAttendeeTrackingEnabled: false}, 2],
        ['missing policy', undefined, 1],
        ['no attendees', attendeesEnabledPolicy, 0],
    ] as const)('leaves total per attendee empty for %s', (_scenario, policy, attendeeCount) => {
        // Given a policy or attendee count for which the report table leaves the cell empty.
        const options = {policy, attendeeCount};

        // When the selected field is displayed for a known amount or a receipt still scanning.
        for (const transaction of [{}, {amount: 0, merchant: '', receipt: {receiptID: 123, state: CONST.IOU.RECEIPT_STATE.SCANNING}}]) {
            const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, transaction, options);

            // Then neither an amount nor a scanning placeholder is shown or offered for copying.
            expect(field).toEqual(expect.objectContaining({title: '', copyable: false, copyValue: ''}));
        }
    });

    it.each([
        [undefined, 'EUR:1000'],
        [-1250, 'USD:1250'],
        [0, 'USD:0'],
        [1250, 'USD:-1250'],
    ])('shows the correct total and currency for converted amount %s', (convertedAmount, expected) => {
        // Given an offline expense, a converted expense, a zero total, or a refund.
        const transaction = {convertedAmount};

        // When its Total column is displayed as a field.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TOTAL, transaction);

        // Then missing conversion falls back to the transaction currency while zero and refund signs are preserved.
        expect(field).toEqual(expect.objectContaining({title: expected, copyValue: expected, interactive: false, shouldShowRightIcon: false}));
    });

    it('displays the original purchase currency separately from the report currency', () => {
        // Given a card purchase in GBP that was converted to EUR and belongs to a USD report.
        const transaction = {originalAmount: -800, originalCurrency: 'GBP', convertedAmount: -1250};

        // When the original purchase amount is selected.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT, transaction);

        // Then the field retains the actual purchase amount and currency.
        expect(field?.title).toBe('GBP:800');
    });

    it('uses the modified expense amount when dividing the total among attendees', () => {
        // Given an expense whose amount was edited optimistically before the server responds.
        const transaction = {modifiedAmount: -1800};

        // When total per attendee is displayed for two attendees.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, transaction);

        // Then the field agrees with the updated expense amount.
        expect(field?.title).toBe('EUR:900');
    });

    it.each([CONST.IOU.RECEIPT_STATE.SCAN_READY, CONST.IOU.RECEIPT_STATE.SCANNING])('shows the scanning status instead of a per-attendee amount for %s receipts', (state) => {
        // Given a receipt with no extracted merchant or amount yet.
        const transaction = {amount: 0, merchant: '', receipt: {receiptID: 123, state}};

        // When total per attendee is selected while SmartScan is processing the receipt.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, transaction);

        // Then the field matches the table's scanning status instead of presenting a zero expense.
        expect(field?.title).toBe('iou.receiptStatusTitle');
    });

    it.each([
        [{amount: -1800, merchant: 'Merchant', receipt: {receiptID: 123, state: CONST.IOU.RECEIPT_STATE.OPEN}}, 'EUR:900'],
        [{amount: 0, merchant: '', modifiedAmount: -2400, receipt: {receiptID: 123, state: CONST.IOU.RECEIPT_STATE.SCANNING}}, 'EUR:1200'],
        [{amount: 0}, 'EUR:0'],
    ])('displays the per-attendee amount once it is known (%j)', (transaction, expected) => {
        // Given a completed scan, a manual correction during scanning, or a legitimate zero amount.
        // When total per attendee is displayed.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, transaction);

        // Then the scanning placeholder does not hide a known amount.
        expect(field?.title).toBe(expected);
    });

    it('reads payroll information from the parent report', () => {
        // Given a selected report-level field while viewing an individual expense.
        const column = CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID;

        // When the expense field is rendered.
        const field = renderField(column);

        // Then the value comes from the parent report and remains read-only.
        expect(field).toEqual(expect.objectContaining({title: 'payroll-123', interactive: false}));
    });
});
