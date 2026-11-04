import type {WisePaymentAmounts} from '@components/WisePaymentSummary/types';
import getWisePaymentSummaryRows from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

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
});
