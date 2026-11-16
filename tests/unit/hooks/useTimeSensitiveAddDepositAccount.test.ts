import {renderHook, waitFor} from '@testing-library/react-native';

import useTimeSensitiveAddDepositAccount from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddDepositAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policy1';
const BANK_ACCOUNT_ID = '101';

function makePolicy(isCollectDepositAccountsEnabled: boolean) {
    return {
        id: POLICY_ID,
        isCollectDepositAccountsEnabled,
    };
}

function makeBankAccount(type: ValueOf<typeof CONST.BANK_ACCOUNT.TYPE> | undefined, state: ValueOf<typeof CONST.BANK_ACCOUNT.STATE>) {
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

    it('shows when a workspace collects deposit accounts and the user has no deposit account', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('does not show when the collecting workspace is archived', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...makePolicy(true), archivedDate: '2026-08-01 00:00:00.000'});

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());
        await waitForBatchedUpdates();

        expect(result.current.shouldShowAddDepositAccount).toBe(false);
    });

    it('does not show when the collecting workspace is pending deletion', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {...makePolicy(true), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());
        await waitForBatchedUpdates();

        expect(result.current.shouldShowAddDepositAccount).toBe(false);
    });

    it('shows when the only open account has no explicit personal type', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, makePolicy(true));
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [BANK_ACCOUNT_ID]: makeBankAccount(undefined, CONST.BANK_ACCOUNT.STATE.OPEN),
        });

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount());

        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('does not show when no workspace collects deposit accounts', async () => {
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
});
