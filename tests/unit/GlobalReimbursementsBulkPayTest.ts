import {followGlobalReimbursementsBulkPay, settleGlobalReimbursementsBulkPayReport} from '@libs/actions/GlobalReimbursementsBulkPay';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const INTRO_DATA = {bankAccountID: 99, bankCountry: CONST.COUNTRY.US, bankCurrency: CONST.CURRENCY.USD};
const BANK_ACCOUNT = {...INTRO_DATA, accountNumber: 'XXXXXX1234'};
const PAID = {isPaid: true, needsGlobalReimbursements: false};
const REJECTED = {isPaid: false, needsGlobalReimbursements: true};
const FAILED = {isPaid: false, needsGlobalReimbursements: false};

async function getModalData() {
    await waitForBatchedUpdates();
    return getOnyxValue(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL);
}

describe('GlobalReimbursementsBulkPay', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('lists the skipped and the rejected reports in one modal after the last response', async () => {
        // Given a click that pays reports A and C and skips report B
        followGlobalReimbursementsBulkPay({
            bankAccount: BANK_ACCOUNT,
            pendingReportNames: new Map([
                ['A', 'Report A'],
                ['C', 'Report C'],
            ]),
            skippedReportNames: ['Report B'],
            hasPaidReports: false,
        });

        // When report A is paid
        expect(settleGlobalReimbursementsBulkPayReport('A', PAID)).toBe(true);

        // Then nothing shows yet, because report C could still be rejected and belongs in the same modal
        expect(await getModalData()).toBeUndefined();

        // When the backend rejects report C
        expect(settleGlobalReimbursementsBulkPayReport('C', REJECTED)).toBe(true);

        // Then one modal lists both unpaid reports for the paying account
        expect(await getModalData()).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Report B', 'Report C']});
    });

    it('opens the intro for several reports when the only payment is rejected next to a skipped report', async () => {
        // Given a click that pays one report and skips another
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: ['Report B'], hasPaidReports: false});

        // When the backend rejects the payment
        settleGlobalReimbursementsBulkPayReport('A', REJECTED);

        // Then the intro opens without a list, because no report was paid to list them next to
        expect(await getModalData()).toEqual({...INTRO_DATA, isPayingMultipleReports: true});
    });

    it('opens the intro for one report right away when the click only skipped that report', async () => {
        // Given a click with nothing to pay
        // When it skips its only report
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map(), skippedReportNames: ['Report B'], hasPaidReports: false});

        // Then the intro opens with the copy for one report, without waiting for any response
        expect(await getModalData()).toEqual({...INTRO_DATA, isPayingMultipleReports: false});
    });

    it('lists a rejected report next to payments it does not wait for, like invoices', async () => {
        // Given a click that already paid invoices and pays one expense report
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: [], hasPaidReports: true});

        // When the backend rejects the expense report
        settleGlobalReimbursementsBulkPayReport('A', REJECTED);

        // Then the list shows, because the invoices count as paid
        expect(await getModalData()).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Report A']});
    });

    it('does not count a payment that failed for another reason as paid, and does not list it', async () => {
        // Given a click that pays one report and skips another
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: ['Report B'], hasPaidReports: false});

        // When the payment fails without the global reimbursements signal
        settleGlobalReimbursementsBulkPayReport('A', FAILED);

        // Then the intro opens for the skipped report alone, because the failed one shows its own error
        expect(await getModalData()).toEqual({...INTRO_DATA, isPayingMultipleReports: false});
    });

    it('shows nothing when every report was paid', async () => {
        // Given a click that pays one report and skips none
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: [], hasPaidReports: false});

        // When the payment goes through
        settleGlobalReimbursementsBulkPayReport('A', PAID);

        // Then no modal interrupts the admin
        expect(await getModalData()).toBeUndefined();
    });

    it('gives each click its own modal, even when an earlier click never gets a response', async () => {
        // Given a first click whose payment never gets a response, and a second click
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: ['Report B'], hasPaidReports: false});
        followGlobalReimbursementsBulkPay({
            bankAccount: BANK_ACCOUNT,
            pendingReportNames: new Map([
                ['C', 'Report C'],
                ['D', 'Report D'],
            ]),
            skippedReportNames: [],
            hasPaidReports: false,
        });

        // When the payments of the second click have their responses
        settleGlobalReimbursementsBulkPayReport('C', PAID);
        settleGlobalReimbursementsBulkPayReport('D', REJECTED);

        // Then the second click lists only its own report
        expect(await getModalData()).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Report D']});
    });

    it('forgets an earlier click that still waits for a report the admin pays again', async () => {
        // Given a click whose payment of report A never gets a response, and a later click that pays report A again
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: ['Stale report'], hasPaidReports: true});
        followGlobalReimbursementsBulkPay({bankAccount: BANK_ACCOUNT, pendingReportNames: new Map([['A', 'Report A']]), skippedReportNames: [], hasPaidReports: true});

        // When the backend rejects report A
        settleGlobalReimbursementsBulkPayReport('A', REJECTED);

        // Then the later click lists it, without the report the earlier click skipped
        expect(await getModalData()).toEqual({...BANK_ACCOUNT, unpaidReportNames: ['Report A']});
    });

    it('leaves a payment outside of bulk pay to the caller', () => {
        // Given no bulk pay click that pays the report
        // When its payment is rejected
        const isBulkPayReport = settleGlobalReimbursementsBulkPayReport('unknown', REJECTED);

        // Then the caller keeps the backend signal, so the intro opens as it does for a single report
        expect(isBulkPayReport).toBe(false);
    });
});
