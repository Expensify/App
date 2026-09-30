import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import ChangeBillingCurrency from '@pages/settings/Subscription/PaymentCard/ChangeBillingCurrency';

import {updateBillingCurrency} from '@userActions/PaymentMethods';
import type * as PaymentMethodsActions from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {FundList} from '@src/types/onyx';

import type ReactNative from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The page is web-only; index.native.tsx renders a not-found view, and Jest resolves the native variant by default.
jest.mock('@pages/settings/Subscription/PaymentCard/ChangeBillingCurrency', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jest.requireActual('@pages/settings/Subscription/PaymentCard/ChangeBillingCurrency/index.tsx');
});

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html.replaceAll(/<[^>]*>/g, ''));
});

jest.mock('@userActions/PaymentMethods', () => {
    const actual = jest.requireActual<typeof PaymentMethodsActions>('@userActions/PaymentMethods');
    return {
        ...actual,
        updateBillingCurrency: jest.fn(),
    };
});

const CARD_CURRENCY = CONST.PAYMENT_CARD_CURRENCY.AUD;
const ABANDONED_CURRENCY = CONST.PAYMENT_CARD_CURRENCY.GBP;
const SECURITY_CODE = '123';

const FUND_LIST: FundList = {
    billingCard: {
        accountData: {
            currency: CARD_CURRENCY,
            additionalData: {
                isBillingCard: true,
            },
        },
    },
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const getSaveLabel = () => TestHelper.translateLocal('common.save');

const renderPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY}
                            component={ChangeBillingCurrency}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('ChangeBillingCurrency', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it("shows and submits the card's currency, not a pick abandoned in an earlier visit", async () => {
        // Given a currency picked and never saved on an earlier visit. Nothing clears the draft on the way out, so it is
        // still in Onyx when the page opens and FormProvider seeds its values from it on the first render, before the
        // page's mount effect clears it. The add-card form needed a render gate for exactly this ordering; this page
        // needs none only while the currency stays outside FormProvider and is read live from the draft.
        await Onyx.merge(ONYXKEYS.FUND_LIST, FUND_LIST);
        await Onyx.merge(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT, {currency: ABANDONED_CURRENCY});
        await waitForBatchedUpdatesWithAct();

        // When the page opens and the user saves with only a security code
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => {
            expect(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()})).toBeOnTheScreen();
        });

        // Then the page shows the card's currency once the clear lands, rather than the abandoned pick
        expect(screen.getByText(CARD_CURRENCY)).toBeOnTheScreen();
        expect(screen.queryByText(ABANDONED_CURRENCY)).not.toBeOnTheScreen();

        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('addDebitCardPage.cvv')), SECURITY_CODE);
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()}));
        await waitForBatchedUpdatesWithAct();

        // And the request carries the card's currency too. FormProvider still holds the abandoned pick in its submitted
        // values, so this fails if the submit ever reads the currency from there.
        expect(updateBillingCurrency).toHaveBeenCalledWith(CARD_CURRENCY, SECURITY_CODE);
    });
});
