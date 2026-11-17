import type {WisePaymentAmounts} from '@components/WisePaymentSummary/types';
import getWisePaymentSummaryRows, {getAmountsWithoutQuote, getWisePaymentSummaryRowCount} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Report} from '@src/types/onyx';

import {convertToDisplayString, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const amounts: WisePaymentAmounts = {
    fee: 10,
    rate: 0.7407,
    debitedAmount: 1010,
    creditedAmount: 741,
    currency: CONST.CURRENCY.USD,
    paymentCurrency: CONST.CURRENCY.GBP,
};

const fullyReimbursableReport: Pick<Report, 'currency' | 'total' | 'reimbursableTotal' | 'nonReimbursableTotal'> = {
    currency: CONST.CURRENCY.USD,
    total: -1000,
    reimbursableTotal: -1000,
    nonReimbursableTotal: 0,
};

function getRows(params: Partial<Parameters<typeof getWisePaymentSummaryRows>[0]>) {
    return getWisePaymentSummaryRows({
        report: fullyReimbursableReport,
        amounts,
        isPayingUnheldOnly: false,
        translate: translateLocal,
        convertToDisplayString,
        ...params,
    });
}

describe('getWisePaymentSummaryRows', () => {
    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('shows the quote amounts in their own currencies', () => {
        // Given a fully reimbursable report paid in full
        // When the rows are built
        const rows = getRows({});

        // Then the admin sees the report total, both sides of the transfer, the fees and the rate, as Wise requires before Pay
        expect(rows).toEqual([
            {label: 'Report total', value: '$10.00'},
            {label: 'Debit amount', value: '$10.10'},
            {label: 'Employee will receive', value: '£7.41'},
            {label: 'Total fees', value: '$0.10'},
            {label: 'FX rate', value: '$1 = £0.7407'},
        ]);
    });

    it('adds the reimbursable amount when part of the report is not reimbursable', () => {
        // Given a report where only $1.00 of $6.60 is reimbursable
        const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560};

        // When the rows are built
        const rows = getRows({report});

        // Then the reimbursable amount follows the report total, so the admin sees why less than the total is paid
        expect(rows.at(0)).toEqual({label: 'Report total', value: '$6.60'});
        expect(rows.at(1)).toEqual({label: 'Reimbursable', value: '$1.00'});
    });

    it('adds the unheld amount when the admin pays only the expenses not on hold', () => {
        // Given a report with $1.00 not on hold, partly non-reimbursable too, where the admin pays only what is not on hold
        const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -500, nonReimbursableTotal: -160, unheldReimbursableTotal: -100};

        // When the rows are built
        const rows = getRows({report, isPayingUnheldOnly: true});

        // Then the unheld amount replaces the reimbursable row, because it is the amount actually paid
        expect(rows.at(1)).toEqual({label: 'Unheld amount being paid', value: '$1.00'});
        expect(rows.map(({label}) => label)).not.toContain('Reimbursable');
    });

    it('shows the tax only when Wise charges one', () => {
        // Given a quote with a tax and one without
        // When the rows are built for both
        const rowsWithTax = getRows({amounts: {...amounts, tax: 25}});
        const rowsWithoutTax = getRows({amounts: {...amounts, tax: 0}});

        // Then the tax row appears after the fees only for the quote that has a tax, since most corridors have none
        expect(rowsWithTax.at(-2)).toEqual({label: 'Tax', value: '$0.25'});
        expect(rowsWithoutTax.map(({label}) => label)).not.toContain('Tax');
    });

    it('names the amounts in the past tense in the payment details', () => {
        // Given a report that was already paid through Wise
        // When the rows are built for View details
        const rows = getRows({isPaid: true});

        // Then the admin reads what was debited and what the employee received, as in the payment details mock
        expect(rows.map(({label}) => label)).toEqual(['Report total', 'Debited amount', 'Employee received', 'Total fees', 'FX rate']);
    });

    it('shows N/A as the FX rate when Wise pays in the same currency', () => {
        // Given a quote where the employee receives the same currency the company is debited in
        // When the rows are built
        const rows = getRows({amounts: {...amounts, rate: 1, creditedAmount: 1000, paymentCurrency: CONST.CURRENCY.USD}});

        // Then the FX rate row stays, so every card has the same rows, but shows N/A since nothing is converted
        expect(rows.at(-1)).toEqual({label: 'FX rate', value: 'N/A'});
    });

    describe('getAmountsWithoutQuote', () => {
        it('pays the employee the reimbursable amount with no fees', () => {
            // Given a report Wise pays without a quote, where only $1.00 of $6.60 is reimbursable
            const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560};

            // When the rows are built from its amounts
            const rows = getRows({report, amounts: getAmountsWithoutQuote({report, isPayingUnheldOnly: false})});

            // Then the company is debited exactly what the employee receives, with zero fees and no conversion
            expect(rows).toEqual([
                {label: 'Report total', value: '$6.60'},
                {label: 'Reimbursable', value: '$1.00'},
                {label: 'Debit amount', value: '$1.00'},
                {label: 'Employee will receive', value: '$1.00'},
                {label: 'Total fees', value: '$0.00'},
                {label: 'FX rate', value: 'N/A'},
            ]);
        });

        it('pays only the unheld amount when the admin pays the expenses not on hold', () => {
            // Given a report with $1.00 not on hold, where the admin pays only what is not on hold
            const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -500, unheldReimbursableTotal: -100};

            // When its amounts are built
            const amountsWithoutQuote = getAmountsWithoutQuote({report, isPayingUnheldOnly: true});

            // Then the debit and the employee amount are the unheld part, because that is what is paid
            expect(amountsWithoutQuote).toMatchObject({fee: 0, debitedAmount: 100, creditedAmount: 100});
        });
    });

    describe('getWisePaymentSummaryRowCount', () => {
        it('reserves the rows of a quote without tax', () => {
            // Given a fully reimbursable report
            // When the card reserves its rows before the quote loads
            const reservedRowCount = getWisePaymentSummaryRowCount({report: fullyReimbursableReport, isPayingUnheldOnly: false});

            // Then it matches a loaded quote with no tax, which most corridors have, so the card keeps its height when the quote arrives
            expect(reservedRowCount).toBe(getRows({}).length);
        });

        it.each([
            ['part of the report is not reimbursable', {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560}, false],
            ['the admin pays only the expenses not on hold', fullyReimbursableReport, true],
        ])('reserves the partial payment row when %s', (_label, report, isPayingUnheldOnly) => {
            // Given a report whose card shows a row for the paid part
            // When the card reserves its rows before the quote loads
            const reservedRowCount = getWisePaymentSummaryRowCount({report, isPayingUnheldOnly});

            // Then the reserved space includes that row, so the card keeps its height when the quote arrives
            expect(reservedRowCount).toBe(getRows({report, isPayingUnheldOnly}).length);
        });
    });
});
