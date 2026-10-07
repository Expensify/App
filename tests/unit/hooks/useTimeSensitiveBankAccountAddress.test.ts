/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useTimeSensitiveBankAccountAddress from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveBankAccountAddress';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList} from '@src/types/onyx';

import type {TimeSensitiveAdminPolicy} from '@selectors/Policy';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const PRIMARY_LOGIN = 'user@example.com';
const OTHER_LOGIN = 'other@example.com';

function makePolicy(overrides: Partial<TimeSensitiveAdminPolicy> & {id: string}): TimeSensitiveAdminPolicy {
    return createMock<TimeSensitiveAdminPolicy>({
        ...overrides,
        name: overrides.name ?? `Policy ${overrides.id}`,
    });
}

function makeBankAccount(bankAccountID: number, state: string, type?: string, addressState?: string): BankAccount {
    return createMock<BankAccount>({
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
    });
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
        // Given a user with no bank accounts
        // When the hook reads an empty policy list
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        // Then no address prompt is shown
        expect(result.current.bankAccountsMissingAddress).toEqual([]);
    });

    it('returns a personal entry when an open personal account is missing addressState', async () => {
        // Given an open personal account with no addressState
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        // When the hook evaluates the account list
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        // Then the personal account is prompted so the user can unblock reimbursements
        expect(result.current.bankAccountsMissingAddress).toHaveLength(1);
        expect(result.current.bankAccountsMissingAddress.at(0)).toMatchObject({
            bankAccountID: 200,
            isPersonalAccount: true,
            key: 'personal-200',
        });
    });

    it('skips personal accounts that already have addressState', async () => {
        // Given an open personal account that already has a state
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.PERSONAL, 'CA'),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        // When the hook evaluates the account list
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([]));

        // Then the account is not prompted
        expect(result.current.bankAccountsMissingAddress).toHaveLength(0);
    });

    it('returns a workspace entry when the reimburser has an open VBA missing addressState', async () => {
        // Given the current user reimburses an open workspace account with no addressState
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

        // When the hook evaluates that workspace
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([policy]));

        // Then the workspace account is prompted for the reimburser
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
        // Given an open workspace account whose reimburser is someone else
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

        // When the hook evaluates that workspace
        const {result} = renderHook(() => useTimeSensitiveBankAccountAddress([policy]));

        // Then the current user is not asked to add the address
        expect(result.current.bankAccountsMissingAddress).toHaveLength(0);
    });
});
