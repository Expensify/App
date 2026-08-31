import {renderHook, waitFor} from '@testing-library/react-native';

import {openDepositAccountSetup} from '@libs/actions/BankAccounts';

import useTimeSensitiveAddDepositAccount from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddDepositAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/BankAccounts', () => ({
    openDepositAccountSetup: jest.fn(),
}));

const POLICY_ID = 'policy1';
const BANK_ACCOUNT_ID = '101';

function makePolicy(isReimbursementEnabled: boolean) {
    return {
        id: POLICY_ID,
        reimbursement: {enabled: isReimbursementEnabled},
    };
}

function makeBankAccount(type: ValueOf<typeof CONST.BANK_ACCOUNT.TYPE>, state: ValueOf<typeof CONST.BANK_ACCOUNT.STATE>) {
    return {
        methodID: Number(BANK_ACCOUNT_ID),
        accountData: {type, state},
    };
}

describe('useTimeSensitiveAddDepositAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows when a policy has reimbursements enabled and the user has no deposit account', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('does not show when no policy has reimbursements enabled', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(false));

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());
        await waitForBatchedUpdates();

        expect(result.current.shouldShowAddDepositAccount).toBe(false);
    });

    it('does not show when the user already has an open personal deposit account', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [BANK_ACCOUNT_ID]: makeBankAccount(CONST.BANK_ACCOUNT.TYPE.PERSONAL, CONST.BANK_ACCOUNT.STATE.OPEN),
        });

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());
        await waitForBatchedUpdates();

        expect(result.current.shouldShowAddDepositAccount).toBe(false);
    });

    it('shows when the only personal account is not open yet', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [BANK_ACCOUNT_ID]: makeBankAccount(CONST.BANK_ACCOUNT.TYPE.PERSONAL, CONST.BANK_ACCOUNT.STATE.PENDING),
        });

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('shows when the only open account is a business account', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [BANK_ACCOUNT_ID]: makeBankAccount(CONST.BANK_ACCOUNT.TYPE.BUSINESS, CONST.BANK_ACCOUNT.STATE.OPEN),
        });

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('fetches the reimbursement data once and not again while the flag is set', async () => {
        const {result, rerender} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(openDepositAccountSetup).toHaveBeenCalledTimes(1));

        await Onyx.merge(ONYXKEYS.RAM_ONLY_IS_LOADING_DEPOSIT_ACCOUNT_SETUP, false);
        rerender({});
        await waitForBatchedUpdates();

        expect(openDepositAccountSetup).toHaveBeenCalledTimes(1);
        expect(result.current.shouldShowAddDepositAccount).toBe(false);
    });

    it('does not fetch when the user already has a deposit account', async () => {
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [BANK_ACCOUNT_ID]: makeBankAccount(CONST.BANK_ACCOUNT.TYPE.PERSONAL, CONST.BANK_ACCOUNT.STATE.OPEN),
        });

        renderHook(() => useTimeSensitiveAddDepositAccount());
        await waitForBatchedUpdates();

        expect(openDepositAccountSetup).not.toHaveBeenCalled();
    });
});
