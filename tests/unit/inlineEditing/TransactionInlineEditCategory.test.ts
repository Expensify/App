import type {TransactionInlineEditParams} from '@libs/actions/TransactionInlineEdit';
import {editTransactionCategoryInline} from '@libs/actions/TransactionInlineEdit';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockWrite = jest.mocked(write);

const TRANSACTION_ID = '7777777777777777777';
const SELF_DM_REPORT_ID = '4242424242';

/** An unreported expense as the Search table renders it, i.e. straight out of the search snapshot. */
const snapshotTransaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
    amount: -10000,
    currency: 'USD',
    merchant: 'Coffee',
    created: '2026-08-12',
    comment: {},
};

const selfDMReport: Report = {
    reportID: SELF_DM_REPORT_ID,
    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
    type: CONST.REPORT.TYPE.CHAT,
};

const policyCategories: PolicyCategories = {
    Benefits: {name: 'Benefits', enabled: true},
    Travel: {name: 'Travel', enabled: true},
};

function buildParams(transaction: TransactionInlineEditParams['transaction']): TransactionInlineEditParams {
    return {
        hash: 123456,
        isOffline: false,
        transactionID: TRANSACTION_ID,
        transaction,
        parentReport: selfDMReport,
        parentReportAction: undefined,
        transactionThreadReport: undefined,
        policy: undefined,
        policyCategories,
        policyTags: undefined,
        reportPolicyTags: undefined,
        policyRecentlyUsedCategories: undefined,
        policyRecentlyUsedTags: undefined,
        isSelfTourViewed: true,
        hasCompletedGuidedSetupFlow: true,
        personalDetailsList: undefined,
        delegateAccountID: undefined,
        isTrackIntentUser: false,
        getCurrencyDecimals: () => 2,
        getCurrencySymbol: () => '$',
    };
}

function getLastWrittenParams(): Record<string, unknown> {
    const call = mockWrite.mock.calls.at(-1);
    expect(call?.at(0)).toBe(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY);
    return (call?.at(1) ?? {}) as Record<string, unknown>;
}

describe('editTransactionCategoryInline', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await waitForBatchedUpdates();
    });

    it('sends the selected category when the transaction is only in the search snapshot', async () => {
        // Search stores its results under snapshot_<hash> only, so right after a fresh sign-in the
        // live TRANSACTION collection has no entry for a row the user can already see and edit.
        expect(await new Promise((resolve) => Onyx.connectWithoutView({key: `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, callback: resolve}))).toBeUndefined();

        editTransactionCategoryInline(buildParams(snapshotTransaction), 'Benefits');
        await waitForBatchedUpdates();

        expect(getLastWrittenParams()).toEqual(expect.objectContaining({transactionID: TRANSACTION_ID, category: 'Benefits'}));
    });

    it('still falls back to the live transaction when the caller has none', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, snapshotTransaction);
        await waitForBatchedUpdates();

        editTransactionCategoryInline(buildParams(undefined), 'Travel');
        await waitForBatchedUpdates();

        expect(getLastWrittenParams()).toEqual(expect.objectContaining({transactionID: TRANSACTION_ID, category: 'Travel'}));
    });
});
