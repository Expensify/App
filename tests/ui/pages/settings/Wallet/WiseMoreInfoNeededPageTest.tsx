import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import openExternalLink from '@libs/openExternalLink';

import WiseMoreInfoNeededPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseMoreInfoNeededPage';

import {getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const CONTINUE_BUTTON_TEST_ID = 'confirmation-primary-button';
const KYC_REVIEW_URL = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';

jest.mock('@userActions/Wise', () => ({getWiseKYCReviewEmbeddedLink: jest.fn(), clearWiseKYCReviewEmbeddedLink: jest.fn()}));
jest.mock('@libs/openExternalLink', () => jest.fn());
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192/business-onboarding/confirm/accept-terms'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage() {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_MORE_INFO_NEEDED}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_MORE_INFO_NEEDED}
                        component={WiseMoreInfoNeededPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID)}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('WiseMoreInfoNeededPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it("fetches the link for the bank account on Continue and redirects to Wise's form once it arrives", async () => {
        // Given the page opened from the terms for a bank account
        await renderPage();

        // When the user presses Continue
        fireEvent.press(screen.getByTestId(CONTINUE_BUTTON_TEST_ID));

        // Then the link is fetched for the bank account from the route, since Wise's form is tied to it
        expect(getWiseKYCReviewEmbeddedLink).toHaveBeenCalledWith(BANK_ACCOUNT_ID);

        // When the link arrives
        await act(() => Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: KYC_REVIEW_URL, isLoading: false}));
        await waitForBatchedUpdatesWithAct();

        // Then the user leaves for Wise's form in the same tab
        expect(openExternalLink).toHaveBeenCalledWith(KYC_REVIEW_URL, undefined, true);
    });
});
