import type {WisePaymentAmounts} from '@components/WisePaymentSummary/types';
import getWisePaymentSummaryRows, {getAmountsWithoutQuote, WISE_PAYMENT_SUMMARY_ROW_COUNT} from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

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

    it('lists the reimbursable amount and the fees before what the company pays', () => {
        // Given a fully reimbursable report paid in full
        // When the rows are built before Pay
        const rows = getRows({});

        // Then the reimbursable amount and the fees come first, so the admin sees how they add up to what the company pays
        expect(rows).toEqual([
            {label: 'Reimbursable', value: '$10.00'},
            {label: 'Total fees', value: '$0.10'},
            {label: 'Company will pay', value: '$10.10'},
            {label: 'Employee will receive', value: '£7.41'},
            {label: 'FX rate', value: '$1 = £0.7407'},
        ]);
    });

    it('shows only the reimbursable part of a report with non-reimbursable expenses', () => {
        // Given a report where only $1.00 of $6.60 is reimbursable
        const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560};

        // When the rows are built
        const rows = getRows({report});

        // Then the reimbursable row shows $1.00, because Wise sends only the reimbursable part
        expect(rows.at(0)).toEqual({label: 'Reimbursable', value: '$1.00'});
    });

    it('shows only the unheld amount when the admin pays the expenses not on hold', () => {
        // Given a report with $1.00 not on hold, where the admin pays only what is not on hold
        const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -500, nonReimbursableTotal: -160, unheldReimbursableTotal: -100};

        // When the rows are built
        const rows = getRows({report, isPayingUnheldOnly: true});

        // Then the reimbursable row shows $1.00, because the held expenses are not part of this payment
        expect(rows.at(0)).toEqual({label: 'Reimbursable', value: '$1.00'});
    });

    it('shows the tax next to the fees only when Wise charges one', () => {
        // Given a quote with a tax and one without
        // When the rows are built for both
        const rowsWithTax = getRows({amounts: {...amounts, tax: 25}});
        const rowsWithoutTax = getRows({amounts: {...amounts, tax: 0}});

        // Then the tax follows the fees only for the quote that has a tax, since both add to what the company pays and most corridors have no tax
        expect(rowsWithTax.at(2)).toEqual({label: 'Tax', value: '$0.25'});
        expect(rowsWithoutTax.map(({label}) => label)).not.toContain('Tax');
    });

    it('names the amounts in the past tense in the payment details', () => {
        // Given a report that was already paid through Wise
        // When the rows are built for View details
        const rows = getRows({isPaid: true});

        // Then the admin reads what was debited and what the employee received, in the payment details layout
        expect(rows.map(({label}) => label)).toEqual(['Report total', 'Debited amount', 'Employee received', 'Total fees', 'FX rate']);
    });

    it('adds the reimbursable part and the tax to the payment details when they apply', () => {
        // Given a paid report where only $1.00 of $6.60 was reimbursable, and Wise charged a tax
        const report = {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560};

        // When the rows are built for View details
        const rows = getRows({report, amounts: {...amounts, tax: 25}, isPaid: true});

        // Then the reimbursable row follows the report total and the tax follows the fees, since the report total alone does not say what Wise sent
        expect(rows).toEqual([
            {label: 'Report total', value: '$6.60'},
            {label: 'Reimbursable', value: '$1.00'},
            {label: 'Debited amount', value: '$10.10'},
            {label: 'Employee received', value: '£7.41'},
            {label: 'Total fees', value: '$0.10'},
            {label: 'Tax', value: '$0.25'},
            {label: 'FX rate', value: '$1 = £0.7407'},
        ]);
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

            // Then the company pays exactly what the employee receives, with zero fees and no conversion
            expect(rows).toEqual([
                {label: 'Reimbursable', value: '$1.00'},
                {label: 'Total fees', value: '$0.00'},
                {label: 'Company will pay', value: '$1.00'},
                {label: 'Employee will receive', value: '$1.00'},
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

    describe('WISE_PAYMENT_SUMMARY_ROW_COUNT', () => {
        it.each([
            ['a fully reimbursable report', fullyReimbursableReport, false],
            ['a report with non-reimbursable expenses', {...fullyReimbursableReport, total: -660, reimbursableTotal: -100, nonReimbursableTotal: -560}, false],
            ['a payment of only the expenses not on hold', {...fullyReimbursableReport, unheldReimbursableTotal: -100}, true],
        ])('matches the rows of a quote without tax for %s', (_label, report, isPayingUnheldOnly) => {
            // Given a report the card reserves rows for before its quote loads
            // When the rows of its loaded quote without tax are built
            const rows = getRows({report, isPayingUnheldOnly});

            // Then the reserved count matches, so the card keeps its height when the quote arrives
            expect(rows).toHaveLength(WISE_PAYMENT_SUMMARY_ROW_COUNT);
        });
    });
});
