/* eslint-disable @typescript-eslint/naming-convention -- bank account list fixtures are keyed by numeric bankAccountID strings like '200' */
import {renderHook} from '@testing-library/react-native';

import useTimeSensitivePendingBankAccount from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitivePendingBankAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const PRIMARY_LOGIN = 'user@example.com';
const OTHER_LOGIN = 'other@example.com';

function makePolicy(id: string, state: string, reimburser = PRIMARY_LOGIN, outputCurrency: string = CONST.CURRENCY.USD): Policy {
    return createMock<Policy>({
        id,
        name: `Policy ${id}`,
        outputCurrency,
        achAccount: {
            bankAccountID: 100,
            accountNumber: '****1234',
            routingNumber: '123456789',
            addressName: 'Test Account',
            bankName: 'Test Bank',
            reimburser,
            state,
        },
    });
}

function makeBankAccount(bankAccountID: number, state: string, bankCurrency: string = CONST.CURRENCY.USD): BankAccount {
    return {
        bankCurrency,
        bankCountry: 'US',
        accountData: {
            bankAccountID,
            state,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        },
    } as BankAccount;
}

describe('useTimeSensitivePendingBankAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns a workspace entry when the reimburser has a PENDING USD workspace account', () => {
        // Given a USD workspace whose bank account is waiting on the current user, its reimburser, to confirm test transactions
        const policy = makePolicy('policy1', CONST.BANK_ACCOUNT.STATE.PENDING);

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([policy]));

        // Then the account is returned with its workspace, so the row opens the workspace's test transaction step
        expect(result.current.pendingBankAccounts).toEqual([{key: 'workspace-policy1-100', bankAccountID: 100, policyID: 'policy1', policyName: 'Policy policy1'}]);
    });

    it('skips a PENDING workspace account when the current user is not the reimburser', () => {
        // Given a PENDING workspace account whose reimburser is a different admin
        const policy = makePolicy('policy1', CONST.BANK_ACCOUNT.STATE.PENDING, OTHER_LOGIN);

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([policy]));

        // Then no row is returned, since only the reimburser can validate the account
        expect(result.current.pendingBankAccounts).toEqual([]);
    });

    it('skips a PENDING workspace account when the workspace currency is not USD', () => {
        // Given a non-USD workspace, where PENDING means setup is incomplete rather than waiting on test transactions
        const policy = makePolicy('policy1', CONST.BANK_ACCOUNT.STATE.PENDING, PRIMARY_LOGIN, CONST.CURRENCY.EUR);

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([policy]));

        // Then no row is returned, since there are no test transactions to confirm
        expect(result.current.pendingBankAccounts).toEqual([]);
    });

    it('skips a workspace account that is not PENDING', () => {
        // Given a workspace account that is already open
        const policy = makePolicy('policy1', CONST.BANK_ACCOUNT.STATE.OPEN);

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([policy]));

        // Then no row is returned
        expect(result.current.pendingBankAccounts).toEqual([]);
    });

    it('returns a Wallet entry for a PENDING USD account shared with the user', async () => {
        // Given a shared bank account, which gives the recipient their own PENDING copy to validate
        const bankAccountList: BankAccountList = {'200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.PENDING)};
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([]));

        // Then the account is returned without a workspace, so the row opens it by bankAccountID like the Wallet does
        expect(result.current.pendingBankAccounts).toEqual([{key: 'wallet-200', bankAccountID: 200}]);
    });

    it('skips a PENDING Wallet account that is not USD', async () => {
        // Given a non-USD account in PENDING, which means its setup is still incomplete
        const bankAccountList: BankAccountList = {'200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.PENDING, CONST.CURRENCY.EUR)};
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([]));

        // Then no row is returned
        expect(result.current.pendingBankAccounts).toEqual([]);
    });

    it('returns one entry when the same account is both a workspace and a Wallet account', async () => {
        // Given the reimburser's own PENDING workspace account, which is also in their bank account list
        const bankAccountList: BankAccountList = {'100': makeBankAccount(100, CONST.BANK_ACCOUNT.STATE.PENDING)};
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();
        const policy = makePolicy('policy1', CONST.BANK_ACCOUNT.STATE.PENDING);

        // When the hook runs
        const {result} = renderHook(() => useTimeSensitivePendingBankAccount([policy]));

        // Then only the workspace entry is returned, so the user doesn't see the same task twice
        expect(result.current.pendingBankAccounts).toHaveLength(1);
        expect(result.current.pendingBankAccounts.at(0)?.key).toBe('workspace-policy1-100');
    });
});
