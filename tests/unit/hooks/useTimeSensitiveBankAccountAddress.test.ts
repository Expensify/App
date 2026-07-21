/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useTimeSensitiveBankAccountAddress from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveBankAccountAddress';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const PRIMARY_LOGIN = 'user@example.com';
const OTHER_LOGIN = 'other@example.com';

function makePolicy(overrides: Partial<Policy> & {id: string}): Policy {
    return {
        ...overrides,
        name: overrides.name ?? `Policy ${overrides.id}`,
    } as Policy;
}

function makeBankAccount(bankAccountID: number, state: string, type?: string, addressState?: string): BankAccount {
    return {
        bankCurrency: 'USD',
        bankCountry: 'US',
        accountData: {
            bankAccountID,
            state,
            type,
            additionalData: {
                addressState,
                country: CONST.COUNTRY.US,
            },
        },
    } as BankAccount;
}

describe('useTimeSensitiveBankAccountAddress', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns empty array when there are no bank accounts missing addressState', () => {
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        expect(result.current.bankAccountsMissingAddress).toEqual([]);
    });

    it('returns a personal entry when an open personal account is missing addressState', async () => {
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        expect(result.current.bankAccountsMissingAddress).toHaveLength(1);
        expect(result.current.bankAccountsMissingAddress.at(0)).toMatchObject({
            bankAccountID: 200,
            isPersonalAccount: true,
            key: 'personal-200',
        });
    });

    it('skips personal accounts that already have addressState', async () => {
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.PERSONAL, 'CA'),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        expect(result.current.bankAccountsMissingAddress).toHaveLength(0);
    });

    it('returns a workspace entry when the reimburser has an open VBA missing addressState', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
        const bankAccountList: BankAccountList = {
            '100': makeBankAccount(100, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.BUSINESS),
        };
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const policy = makePolicy({
            id: 'policy1',
            name: 'Acme Corp',
            achAccount: {
                bankAccountID: 100,
                accountNumber: '****1234',
                routingNumber: '123456789',
                addressName: 'Test Account',
                bankName: 'Test Bank',
                reimburser: PRIMARY_LOGIN,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([policy]));

        expect(result.current.bankAccountsMissingAddress).toHaveLength(1);
        expect(result.current.bankAccountsMissingAddress.at(0)).toMatchObject({
            bankAccountID: 100,
            isPersonalAccount: false,
            policyID: 'policy1',
            policyName: 'Acme Corp',
            key: 'workspace-policy1-100',
        });
    });

    it('skips the workspace entry when the current user is not the reimburser', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
        const bankAccountList: BankAccountList = {
            '100': makeBankAccount(100, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.BUSINESS),
        };
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const policy = makePolicy({
            id: 'policy1',
            achAccount: {
                bankAccountID: 100,
                accountNumber: '****1234',
                routingNumber: '123456789',
                addressName: 'Test Account',
                bankName: 'Test Bank',
                reimburser: OTHER_LOGIN,
                state: CONST.BANK_ACCOUNT.STATE.OPEN,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([policy]));

        expect(result.current.bankAccountsMissingAddress).toHaveLength(0);
    });
});
