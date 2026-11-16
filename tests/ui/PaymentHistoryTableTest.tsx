import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PaymentHistoryTable from '@pages/settings/Subscription/PaymentHistoryPage/PaymentHistoryTable';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Purchase} from '@src/types/onyx/PurchaseList';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

function createPurchase(purchaseID: number, message: Purchase['message'] = {}): Purchase {
    return {
        purchaseID,
        created: `2026-02-${String(purchaseID).padStart(2, '0')} 00:00:00`,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        message,
    };
}

async function setPurchases(purchases: Purchase[]) {
    await Onyx.merge(ONYXKEYS.PURCHASES, Object.fromEntries(purchases.map((purchase) => [String(purchase.purchaseID), purchase])));
    await waitForBatchedUpdatesWithAct();
}

function renderTable() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <PaymentHistoryTable />
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('PaymentHistoryTable', () => {
    beforeEach(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('hides the Paid badge for a plain invoicing2018 bill', async () => {
        // Given a single plain invoice bill, which resolves to the default Paid state
        await setPurchases([createPurchase(1, {billingType: CONST.BILLING.TYPE_INVOICING})]);

        // When the table renders
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // Then the row shows but its Paid badge is hidden, because the invoiced amount may not be settled yet
        expect(screen.getByText('$10.00')).toBeOnTheScreen();
        expect(screen.queryByText('Paid')).toBeNull();
    });

    it('keeps the Paid badge for an ordinary successful purchase', async () => {
        // Given an ordinary purchase with no billing type
        await setPurchases([createPurchase(1)]);

        // When the table renders
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // Then the Paid badge is shown
        expect(screen.getByText('Paid')).toBeOnTheScreen();
    });

    it('keeps the modifier badge on an invoice that was later refunded', async () => {
        // Given an invoice bill that was later refunded
        await setPurchases([createPurchase(1, {billingType: CONST.BILLING.TYPE_INVOICING}), createPurchase(2, {billingType: CONST.BILLING.TYPE_REFUND, refundPurchaseID: 1})]);

        // When the table renders
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // Then the Refunded badge stays, because only the default Paid state is hidden for invoices
        expect(screen.getByText('Refunded')).toBeOnTheScreen();
        expect(screen.queryByText('Paid')).toBeNull();
    });

    it('keeps the Failed badge for a failed purchase', async () => {
        // Given a failed bill
        await setPurchases([createPurchase(1, {billingType: CONST.BILLING.TYPE_FAILED})]);

        // When the table renders
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // Then the Failed badge is shown
        expect(screen.getByText('Failed')).toBeOnTheScreen();
    });
});
