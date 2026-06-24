/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTimeSensitiveLockedBankAccount from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveLockedBankAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, BankAccountList} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const PRIMARY_LOGIN = 'user@example.com';
const OTHER_LOGIN = 'other@example.com';

function makePolicy(overrides: Partial<Policy> & {id: string}): Policy {
    return {
        ...overrides,
        name: overrides.name ?? `Policy ${overrides.id}`,
    } as Policy;
}

function makeBankAccount(bankAccountID: number, state: string, type?: string): BankAccount {
    return {
        bankCurrency: 'USD',
        bankCountry: 'US',
        accountData: {
            bankAccountID,
            state,
            type,
        },
    } as BankAccount;
}

describe('useTimeSensitiveLockedBankAccount', () => {
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

    it('returns empty array when adminPolicies is undefined and BANK_ACCOUNT_LIST is empty', () => {
        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount(undefined));

        expect(result.current.lockedBankAccounts).toEqual([]);
    });

    it('returns empty array when adminPolicies is an empty array and BANK_ACCOUNT_LIST is empty', () => {
        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        expect(result.current.lockedBankAccounts).toEqual([]);
    });

    it('returns a workspace entry when the policy has a locked achAccount and current user is the reimburser', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
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
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        expect(result.current.lockedBankAccounts).toHaveLength(1);
        expect(result.current.lockedBankAccounts.at(0)).toMatchObject({
            bankAccountID: 100,
            policyName: 'Acme Corp',
        });
    });

    it('skips the workspace entry when the current user is NOT the reimburser', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
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
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        expect(result.current.lockedBankAccounts).toHaveLength(0);
    });

    it('renders a personal entry when BANK_ACCOUNT_LIST has a locked PERSONAL account', async () => {
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.LOCKED, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        const entry = result.current.lockedBankAccounts.at(0);
        expect(result.current.lockedBankAccounts).toHaveLength(1);
        expect(entry?.bankAccountID).toBe(200);
        expect(entry?.policyName).toBeUndefined();
    });

    it('renders a personal entry when accountData.type is undefined (treated as personal)', async () => {
        const bankAccountList: BankAccountList = {
            '201': makeBankAccount(201, CONST.BANK_ACCOUNT.STATE.LOCKED, undefined),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        expect(result.current.lockedBankAccounts).toHaveLength(1);
        expect(result.current.lockedBankAccounts.at(0)?.bankAccountID).toBe(201);
    });

    it('skips a BANK_ACCOUNT_LIST entry whose accountData.type is BUSINESS', async () => {
        const bankAccountList: BankAccountList = {
            '300': makeBankAccount(300, CONST.BANK_ACCOUNT.STATE.LOCKED, CONST.BANK_ACCOUNT.TYPE.BUSINESS),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        expect(result.current.lockedBankAccounts).toHaveLength(0);
    });

    it('suppresses the personal widget when the same bankAccountID is also a workspace locked account', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});

        const bankAccountList: BankAccountList = {
            '100': makeBankAccount(100, CONST.BANK_ACCOUNT.STATE.LOCKED, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
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
                reimburser: PRIMARY_LOGIN,
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        // Only one entry — the workspace one; personal is deduped
        expect(result.current.lockedBankAccounts).toHaveLength(1);
        expect(result.current.lockedBankAccounts.at(0)?.policyName).toBeDefined();
    });

    it('shows the personal widget when a non-reimburser admin has the same bankAccountID as a workspace account', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});

        const bankAccountList: BankAccountList = {
            '100': makeBankAccount(100, CONST.BANK_ACCOUNT.STATE.LOCKED, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
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
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        // Option A fix: workspaceLockedBankAccountIDs.add(...) only runs after the reimburser check,
        // so no workspace widget is shown but the personal widget is NOT suppressed.
        expect(result.current.lockedBankAccounts).toHaveLength(1);
        expect(result.current.lockedBankAccounts.at(0)?.policyName).toBeUndefined();
        expect(result.current.lockedBankAccounts.at(0)?.key).toBe('personal-100');
    });

    it('handles null/undefined BANK_ACCOUNT_LIST without throwing', async () => {
        // Do not merge any bank account list — Onyx will return undefined/null
        await waitForBatchedUpdates();

        expect(() => {
            renderHook(() => useTimeSensitiveLockedBankAccount([]));
        }).not.toThrow();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));
        expect(result.current.lockedBankAccounts).toEqual([]);
    });

    it('handles nullish entries inside BANK_ACCOUNT_LIST without throwing', async () => {
        // Simulate a partially cleared Onyx collection where an entry is null
        const bankAccountList = {'999': null} as unknown as BankAccountList;
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        expect(() => {
            renderHook(() => useTimeSensitiveLockedBankAccount([]));
        }).not.toThrow();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));
        expect(result.current.lockedBankAccounts).toEqual([]);
    });

    it('emits keys in workspace-policyID-bankAccountID format for workspace entries', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
        await waitForBatchedUpdates();

        const policy = makePolicy({
            id: 'policy42',
            achAccount: {
                bankAccountID: 777,
                accountNumber: '****5678',
                routingNumber: '987654321',
                addressName: 'Test Account',
                bankName: 'Test Bank',
                reimburser: PRIMARY_LOGIN,
                state: CONST.BANK_ACCOUNT.STATE.LOCKED,
            },
        });

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        expect(result.current.lockedBankAccounts.at(0)?.key).toBe('workspace-policy42-777');
    });

    it('emits keys in personal-bankAccountID format for personal entries', async () => {
        const bankAccountList: BankAccountList = {
            '888': makeBankAccount(888, CONST.BANK_ACCOUNT.STATE.LOCKED, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        expect(result.current.lockedBankAccounts.at(0)?.key).toBe('personal-888');
    });

    it('does not render a workspace entry when achAccount state is not LOCKED', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: PRIMARY_LOGIN});
        await waitForBatchedUpdates();

        const policy = makePolicy({
            id: 'policy1',
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

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([policy]));

        expect(result.current.lockedBankAccounts).toHaveLength(0);
    });

    it('does not render a personal entry when the account state is not LOCKED', async () => {
        const bankAccountList: BankAccountList = {
            '200': makeBankAccount(200, CONST.BANK_ACCOUNT.STATE.OPEN, CONST.BANK_ACCOUNT.TYPE.PERSONAL),
        };

        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveLockedBankAccount([]));

        expect(result.current.lockedBankAccounts).toHaveLength(0);
    });
});
