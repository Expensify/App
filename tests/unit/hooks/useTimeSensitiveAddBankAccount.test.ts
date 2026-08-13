import {renderHook, waitFor} from '@testing-library/react-native';

import useTimeSensitiveAddBankAccount from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddBankAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const REPORT_ID = '1';

function makeWaitingReport(reportID: string, ownerAccountID = ACCOUNT_ID): Report {
    return {
        reportID,
        ownerAccountID,
        isWaitingOnBankAccount: true,
    } as Report;
}

function makeQueuedAction(
    reportActionID: string,
    paymentType: typeof CONST.IOU.PAYMENT_TYPE.VBBA | typeof CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
    created: string,
): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED> {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
        created,
        originalMessage: {paymentType},
    };
}

async function setCurrentUserPaymentState() {
    await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
    await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {});
    await Onyx.set(ONYXKEYS.USER_WALLET, {tierName: CONST.WALLET.TIER_NAME.SILVER});
    await waitForBatchedUpdates();
}

describe('useTimeSensitiveAddBankAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await setCurrentUserPaymentState();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('reacts when an ACH action without a childReportID arrives in the waiting report collection', async () => {
        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(false);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, makeWaitingReport(REPORT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            action1: makeQueuedAction('action1', CONST.IOU.PAYMENT_TYPE.VBBA, '2026-07-20 10:00:00.000'),
        });

        await waitFor(() => expect(result.current.shouldShowAddBankAccount).toBe(true));
    });

    it('does not show for a Wallet payment', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, makeWaitingReport(REPORT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            action1: makeQueuedAction('action1', CONST.IOU.PAYMENT_TYPE.EXPENSIFY, '2026-07-20 10:00:00.000'),
        });

        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(false);
    });

    it('uses the latest queued action when a report has multiple payment attempts', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, makeWaitingReport(REPORT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            bankAction: makeQueuedAction('bankAction', CONST.IOU.PAYMENT_TYPE.VBBA, '2026-07-20 10:00:00.000'),
            walletAction: makeQueuedAction('walletAction', CONST.IOU.PAYMENT_TYPE.EXPENSIFY, '2026-07-20 10:01:00.000'),
        });

        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(false);
    });

    it('does not show for another user waiting on a bank account', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, makeWaitingReport(REPORT_ID, OTHER_ACCOUNT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            action1: makeQueuedAction('action1', CONST.IOU.PAYMENT_TYPE.VBBA, '2026-07-20 10:00:00.000'),
        });

        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(false);
    });

    it('does not show when the user already has a default credit bank account', async () => {
        const bankAccount: BankAccount = {
            bankCurrency: CONST.CURRENCY.USD,
            bankCountry: CONST.COUNTRY.US,
            accountData: {defaultCredit: true},
        };
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {bankAccount});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, makeWaitingReport(REPORT_ID));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            action1: makeQueuedAction('action1', CONST.IOU.PAYMENT_TYPE.VBBA, '2026-07-20 10:00:00.000'),
        });

        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(false);
    });

    it('continues past a Wallet wait when another report is waiting for a bank account', async () => {
        const secondReportID = '3';
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
            [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: makeWaitingReport(REPORT_ID),
            [`${ONYXKEYS.COLLECTION.REPORT}${secondReportID}`]: makeWaitingReport(secondReportID),
        });
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`]: {
                walletAction: makeQueuedAction('walletAction', CONST.IOU.PAYMENT_TYPE.EXPENSIFY, '2026-07-20 10:00:00.000'),
            },
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${secondReportID}`]: {
                bankAction: makeQueuedAction('bankAction', CONST.IOU.PAYMENT_TYPE.VBBA, '2026-07-20 10:01:00.000'),
            },
        });

        const {result} = renderHook(() => useTimeSensitiveAddBankAccount());

        expect(result.current.shouldShowAddBankAccount).toBe(true);
    });
});
