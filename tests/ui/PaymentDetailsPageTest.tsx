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

// Enough extra members to reach the search bar threshold together with Bob and Todd
const OTHER_MEMBERS = Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT - 2}, (_, index) => ({
    accountID: 100 + index,
    login: `member${index}@example.com`,
    displayName: `Member ${index}`,
}));
const SEARCH_PLACEHOLDER = 'Find an active user';

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
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, Object.fromEntries([BOB, TODD, ...OTHER_MEMBERS].map((member) => [member.accountID, member])));
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

        // And the search bar is hidden because two members are quick to scan
        expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).toBeNull();
    });

    it('filters the list as the user searches once there are enough members to search', async () => {
        // Given a month with enough billed members to show the search bar
        await setPurchase([TODD.accountID, BOB.accountID, ...OTHER_MEMBERS.map((member) => member.accountID)]);
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await screen.findByText(BOB.displayName);

        // When the user searches for one of them
        fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), 'bob');

        // Then only the matching member stays in the list, and the count still shows every active user
        await waitFor(() => expect(screen.queryByText(TODD.displayName)).toBeNull());
        expect(screen.getByText(BOB.displayName)).toBeOnTheScreen();
        expect(screen.getByText(`${CONST.STANDARD_LIST_ITEM_LIMIT} active users`)).toBeOnTheScreen();

        // And a search that matches nobody shows the no-results message
        fireEvent.changeText(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), 'zzzz');
        expect(await screen.findByText('No results found')).toBeOnTheScreen();
        expect(screen.queryByText(BOB.displayName)).toBeNull();
    });

    it('hides the Activity section for a month with no billed members', async () => {
        // Given a failed month nobody was billed for
        await setPurchase([], CONST.BILLING.TYPE_FAILED);

        // When the details page renders
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the details still show, but the Activity label, the search field, and the count are all hidden
        expect(await screen.findByText('$10.00')).toBeOnTheScreen();
        expect(screen.queryByText('Activity')).toBeNull();
        expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).toBeNull();
        expect(screen.queryByText(/active user/)).toBeNull();
    });
});
