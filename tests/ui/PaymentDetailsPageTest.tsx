import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import PaymentDetailsPage from '@pages/settings/Subscription/PaymentHistoryPage/PaymentDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Purchase} from '@src/types/onyx/PurchaseList';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

// The page fetches the purchase details on mount; the tests seed that data in Onyx instead.
jest.mock('@userActions/Subscription', () => ({
    __esModule: true,
    openPaymentDetailsPage: jest.fn(),
}));

const PURCHASE_ID = 1001;
const BOB = {accountID: 2, login: 'bob@example.com', displayName: 'Bob Clyde'};
const TODD = {accountID: 3, login: 'todd@example.com', displayName: 'Todd Clyde'};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS}
                            component={PaymentDetailsPage}
                            initialParams={{purchaseID: String(PURCHASE_ID)}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function setPurchase(activeUsers: number[], billingType?: string) {
    const purchase: Purchase = {
        purchaseID: PURCHASE_ID,
        created: '2026-02-01 00:00:00',
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        message: {billingType},
        activeUsers,
        isLoaded: true,
    };
    await Onyx.merge(ONYXKEYS.PURCHASES, {[PURCHASE_ID]: purchase});
    await waitForBatchedUpdatesWithAct();
}

describe('PaymentDetailsPage Activity list', () => {
    beforeEach(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.PAYMENT_HISTORY]);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[BOB.accountID]: BOB, [TODD.accountID]: TODD});
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('lists each billed member once, with the deduped count under the Activity header', async () => {
        // Given a month where Todd was billed under two workspaces
        await setPurchase([TODD.accountID, BOB.accountID, TODD.accountID]);

        // When the details page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the count matches the deduped members and each member is listed with their email
        expect(await screen.findByText('Activity')).toBeOnTheScreen();
        expect(screen.getByText('2 active users')).toBeOnTheScreen();
        expect(screen.getByText(BOB.displayName)).toBeOnTheScreen();
        expect(screen.getByText(TODD.displayName)).toBeOnTheScreen();
        expect(screen.getByText(BOB.login)).toBeOnTheScreen();
    });

    it('filters the list as the user searches', async () => {
        // Given a month with two billed members
        await setPurchase([TODD.accountID, BOB.accountID]);
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await screen.findByText(BOB.displayName);

        // When the user searches for one of them
        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), 'bob');

        // Then only the matching member stays in the list
        await waitFor(() => expect(screen.queryByText(TODD.displayName)).toBeNull());
        expect(screen.getByText(BOB.displayName)).toBeOnTheScreen();

        // And a search that matches nobody shows the no-results message
        fireEvent.changeText(screen.getByTestId('selection-list-text-input'), 'zzzz');
        // The message is aria-hidden because the search input announces it, so the query has to include hidden elements
        expect(await screen.findByText('No results found', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(screen.queryByText(BOB.displayName)).toBeNull();
    });

    it('shows an empty state for a failed month with no billed members', async () => {
        // Given a failed month nobody was billed for
        await setPurchase([], CONST.BILLING.TYPE_FAILED);

        // When the details page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the Activity section is still there, with an empty state instead of a blank section or a search field
        expect(await screen.findByText('Activity')).toBeOnTheScreen();
        expect(screen.getByText('No active users this month.')).toBeOnTheScreen();
        expect(screen.queryByTestId('selection-list-text-input')).toBeNull();
    });
});
