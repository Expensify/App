import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePaymentOptions from '@hooks/usePaymentOptions';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const policy: Policy = {
    ...createRandomPolicy(1),
    id: 'ABAPolicy',
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.AUD,
    reimbursement: {countries: {[CONST.COUNTRY.AU]: {bankAccountID: 1, state: CONST.BANK_ACCOUNT.STATE.OPEN}}},
};
const expenseReport = {reportID: '100', type: CONST.REPORT.TYPE.EXPENSE, policyID: policy.id, currency: CONST.CURRENCY.AUD} as Report;

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

async function renderPaymentOptions(onPress = jest.fn()) {
    const {result} = renderHook(() => usePaymentOptions({iouReport: expenseReport, policyID: policy.id, currency: CONST.CURRENCY.AUD, onPress}), {wrapper: Wrapper});
    await waitForBatchedUpdatesWithAct();
    return result.current.find((option) => option.text === translateLocal('iou.payViaABA'));
}

describe('usePaymentOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        });
    });

    it('offers paying via ABA on a workspace that can pay via ABA', async () => {
        // Given the payment options on an admin's AUD workspace with an open AU withdrawal account
        const onPress = jest.fn();
        const payViaABAOption = await renderPaymentOptions(onPress);

        // When "Pay via ABA" is picked
        payViaABAOption?.onSelected?.();

        // Then picking the option pays the report as Elsewhere via ABA
        expect(onPress).toHaveBeenCalledWith({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, paymentMethod: CONST.PAYMENT_METHODS.ABA});
    });

    it('does not offer paying via ABA when the workspace has no AU withdrawal account', async () => {
        // Given an AUD workspace without an AU withdrawal account
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {reimbursement: {countries: null}});
        });

        // When its payment options are built
        const payViaABAOption = await renderPaymentOptions();

        // Then the option isn't there, since there's no account for the ABA file to pay from
        expect(payViaABAOption).toBeUndefined();
    });

    it('disables paying via ABA while offline', async () => {
        // Given the user is offline
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });

        // When the payment options are built
        const payViaABAOption = await renderPaymentOptions();

        // Then the option is disabled, since the ABA file can only be downloaded while online
        expect(payViaABAOption?.disabled).toBe(true);
    });
});
