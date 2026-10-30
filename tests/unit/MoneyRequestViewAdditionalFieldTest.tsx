import {render} from '@testing-library/react-native';

import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MoneyRequestViewAdditionalField from '@components/ReportActionItem/MoneyRequestViewAdditionalField';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

type FieldOptions = {
    policy?: Policy;
    policyCategories?: PolicyCategories;
    policyTagLists?: PolicyTagLists;
    report?: Report;
};

function renderField(column: SearchColumnType, overrides: Partial<Transaction> = {}, {policy, policyCategories, policyTagLists, report}: FieldOptions = {}) {
    render(
        <MoneyRequestViewAdditionalField
            column={column}
            transaction={{
                transactionID: '1',
                reportID: '2',
                amount: -1000,
                currency: 'EUR',
                created: '2026-09-01',
                merchant: 'Merchant',
                ...overrides,
            }}
            report={
                report ?? {
                    reportID: '2',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: 'USD',
                }
            }
            policy={policy}
            policyCategories={policyCategories}
            policyTagLists={policyTagLists}
        />,
    );
    return jest.mocked(MenuItemField).mock.calls.at(-1)?.at(0);
}

describe('additional expense field values', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
        CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
        CONST.SEARCH.TABLE_COLUMNS.POSTED,
        CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
        CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
        CONST.SEARCH.TABLE_COLUMNS.HELD,
    ])('does not create a second field for %s', (column) => {
        // Given a table column whose information already appears in the expense fields or header.
        // When the column reaches the additional field renderer.
        renderField(column);

        // Then the expense view does not repeat that information in another field.
        expect(MenuItemField).not.toHaveBeenCalled();
    });

    it.each([
        [1234, '1234'],
        ['5678', '5678'],
        [CONST.DEFAULT_NUMBER_ID, ''],
        [String(CONST.DEFAULT_NUMBER_ID), ''],
        [undefined, ''],
    ])('uses the report table MCC format for %s', (mcc, expected) => {
        // Given a transaction that may have a merchant category code or the backend's missing value.
        const transaction = {mcc};

        // When MCC is selected for the expense view.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.MCC, transaction);

        // Then a valid code can be copied and a missing code stays empty.
        expect(field).toEqual(
            expect.objectContaining({
                value: expected,
                isValueSelectable: !!expected,
            }),
        );
    });

    it('resolves category and tag GL codes in the workspace tag order', () => {
        // Given codes with backend quotes and tag lists stored in a different order from their hierarchy.
        const glCodeKey = 'GL Code';
        const transaction = {
            category: 'Meals',
            tag: 'Sales:North',
        };
        const options = {
            policyCategories: {
                Meals: {name: 'Meals', enabled: true, [glCodeKey]: '"200"'},
            },
            policyTagLists: {
                Regions: {
                    name: 'Regions',
                    required: false,
                    orderWeight: 1,
                    tags: {North: {name: 'North', enabled: true, [glCodeKey]: '"400"'}},
                },
                Departments: {
                    name: 'Departments',
                    required: false,
                    orderWeight: 0,
                    tags: {Sales: {name: 'Sales', enabled: true, [glCodeKey]: '"300"'}},
                },
            },
        };

        // When the selected accounting fields are rendered for the expense's category and tags.
        const categoryField = renderField(CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE, transaction, options);
        const tagField = renderField(CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE, transaction, options);

        // Then the codes follow the workspace hierarchy without backend quote characters.
        expect(categoryField?.value).toBe('200');
        expect(tagField?.value).toBe('300, 400');
    });

    it.each([
        [{currencyConversionRate: '1.234567'}, '1.2346 EUR/USD'],
        [{currencyConversionRate: '1.5'}, '1.5000 EUR/USD'],
        [{currencyConversionRate: '1'}, ''],
        [{currency: 'USD', currencyConversionRate: '1.5'}, ''],
    ])('uses report conversion formatting for %j', (transaction, expected) => {
        // Given a foreign expense with a rate, or an expense that needs no conversion in this report.
        // When the Exchange rate field is rendered.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE, transaction);

        // Then the displayed rate matches the table and domestic expenses do not offer an empty value for copying.
        expect(field).toEqual(
            expect.objectContaining({
                value: expected,
                isValueSelectable: !!expected,
            }),
        );
    });

    it.each([
        [CONST.IOU.REQUEST_TYPE.MANUAL, 'customTax'],
        [CONST.IOU.REQUEST_TYPE.PER_DIEM, ''],
        [CONST.IOU.REQUEST_TYPE.TIME, ''],
    ])('shows a customized tax code only for an eligible %s expense', (iouRequestType, expected) => {
        // Given a workspace with a customized tax code and an expense type that may not support tax.
        const policy = createMock<Policy>({
            taxRates: {
                taxes: {
                    customTax: {
                        name: 'Tax',
                        value: '10%',
                        previousTaxCode: 'oldTax',
                    },
                },
            },
        });

        // When the expense's Tax code field is rendered.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TAX_CODE, {taxCode: 'customTax', iouRequestType}, {policy});

        // Then only eligible expenses display the code, matching the report table.
        expect(field).toEqual(
            expect.objectContaining({
                value: expected,
                isValueSelectable: !!expected,
            }),
        );
    });

    it('leaves tax codes empty when the workspace has not customized them', () => {
        // Given a workspace tax whose backend identifier is not a code entered by a user.
        const policy = createMock<Policy>({
            taxRates: {taxes: {defaultTax: {name: 'Tax', value: '10%'}}},
        });

        // When the expense's Tax code field is rendered.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.TAX_CODE, {taxCode: 'defaultTax'}, {policy});

        // Then the internal tax identifier is not displayed or offered for copying.
        expect(field).toEqual(expect.objectContaining({value: '', isValueSelectable: false}));
    });

    it.each([
        [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID, 'user-123'],
        [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID, 'payroll-123'],
        [CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS, 'order-123'],
    ])('reads %s from the parent report', (column, expected) => {
        // Given a report-level field while viewing an individual expense.
        const report = {
            reportID: '2',
            submitterUserID: 'user-123',
            submitterPayrollID: 'payroll-123',
            orderDealNumbers: 'order-123',
        };

        // When the selected field is rendered.
        const field = renderField(column, {}, {report});

        // Then the report value remains available for copying without an expense editor.
        expect(field).toEqual(expect.objectContaining({value: expected, isValueSelectable: true}));
    });

    it('shows the withdrawal identifier from the expense', () => {
        // Given a reimbursed expense associated with a withdrawal.
        const transaction = {withdrawalID: 'withdrawal-123'};

        // When Withdrawal ID is selected.
        const field = renderField(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID, transaction);

        // Then the user can copy the identifier to reconcile the expense.
        expect(field).toEqual(
            expect.objectContaining({
                value: 'withdrawal-123',
                isValueSelectable: true,
            }),
        );
    });
});
