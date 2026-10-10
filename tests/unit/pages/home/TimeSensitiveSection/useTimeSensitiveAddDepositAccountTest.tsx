import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useTimeSensitiveAddDepositAccount from '@src/pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddDepositAccount';
import type {BankAccount, BankAccountList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const openAccountOfType = (type: string): BankAccountList => {
    const bankAccount: BankAccount = {
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
        accountData: {state: CONST.BANK_ACCOUNT.STATE.OPEN, type},
    };
    return {bankAccount};
};

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

describe('useTimeSensitiveAddDepositAccount', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}collecting`, {id: 'collecting', isCollectDepositAccountsEnabled: true});
        await waitForBatchedUpdates();
    });

    it('shows the task when a collecting workspace exists and the user has no deposit account', async () => {
        // Given a collecting workspace and an empty, loaded bank account list
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount(), {wrapper});

        // Then the task is shown so the user is nudged to add one
        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(true));
    });

    it('hides the task once the user has an open business deposit account', async () => {
        // Given the user added a deposit account with a company name, so it is stored as business
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, openAccountOfType(CONST.BANK_ACCOUNT.TYPE.BUSINESS));
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount(), {wrapper});

        // Then the task is hidden, because a business deposit account still satisfies the requirement
        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(false));
    });

    it('hides the task once the user has an open personal deposit account', async () => {
        // Given the user added a deposit account without a company name, so it is stored as personal
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, openAccountOfType(CONST.BANK_ACCOUNT.TYPE.PERSONAL));
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTimeSensitiveAddDepositAccount(), {wrapper});

        // Then the task is hidden
        await waitFor(() => expect(result.current.shouldShowAddDepositAccount).toBe(false));
    });
});
