import {act, fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setHasRadio} from '@libs/NetworkState';
import openExternalLink from '@libs/openExternalLink';

import WiseKYCReviewPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseKYCReviewPage';

import {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BANK_ACCOUNT_ID = 9053192;
const CONTINUE_BUTTON_TEST_ID = 'confirmation-primary-button';
const LINK = 'https://sandbox.transferwise.tech/embedded-flows/kyc-review?token=abc';
const ERROR_KEY = 1793631091391000;

jest.mock('@userActions/Wise', () => ({getWiseKYCReviewEmbeddedLink: jest.fn(), clearWiseKYCReviewEmbeddedLink: jest.fn()}));
jest.mock('@libs/openExternalLink', () => jest.fn());
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192/business-onboarding/confirm/accept-terms'));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage() {
    await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.WISE_REIMBURSEMENTS]);
    const result = render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW}
                        component={WiseKYCReviewPage}
                        initialParams={{bankAccountID: String(BANK_ACCOUNT_ID)}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    return result;
}

describe('WiseKYCReviewPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        setHasRadio(true);
        await Onyx.clear();
    });

    it('fetches the link to Wise for the bank account on Continue', async () => {
        // Given the page opened from the terms for a bank account
        await renderPage();

        // When the user presses Continue
        fireEvent.press(screen.getByTestId(CONTINUE_BUTTON_TEST_ID));

        // Then the link is fetched for the bank account from the route, since Wise's form is tied to it
        expect(getWiseKYCReviewEmbeddedLink).toHaveBeenCalledWith(BANK_ACCOUNT_ID);
    });

    it("redirects to Wise's form in the same tab once the link it asked for arrives", async () => {
        // Given the user pressed Continue and the link is on its way
        await renderPage();
        fireEvent.press(screen.getByTestId(CONTINUE_BUTTON_TEST_ID));
        expect(openExternalLink).not.toHaveBeenCalled();

        // When the link arrives
        await act(() => Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: LINK, isLoading: false}));
        await waitForBatchedUpdatesWithAct();

        // Then the user leaves for Wise's form
        expect(openExternalLink).toHaveBeenCalledWith(LINK, undefined, true);
    });

    it('does not redirect for a link it did not ask for', async () => {
        // Given a link left over from an earlier visit, as when a fetch returns after its page closed
        await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: LINK, isLoading: false});

        // When the page opens
        await renderPage();

        // Then it waits for Continue, since the user has not asked to leave yet
        expect(openExternalLink).not.toHaveBeenCalled();
    });

    it('shows the error when the link could not be fetched', async () => {
        // Given the page open
        await renderPage();

        // When the fetch fails, as when there is no open review
        await act(() => Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {isLoading: false, errors: {[ERROR_KEY]: 'Something went wrong'}}));
        await waitForBatchedUpdatesWithAct();

        // Then the error shows above Continue, so the user can try again
        expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
        expect(screen.getByTestId(CONTINUE_BUTTON_TEST_ID)).toBeEnabled();
    });

    it('disables Continue offline', async () => {
        // Given an offline device, where a read is not sent until the connection returns
        setHasRadio(false);

        // When the page opens
        await renderPage();

        // Then Continue cannot be pressed, so the user does not wait on a link that never comes
        expect(screen.getByTestId(CONTINUE_BUTTON_TEST_ID)).toBeDisabled();
    });

    it('drops the link when the page closes', async () => {
        // Given the page open
        const {unmount} = await renderPage();
        expect(clearWiseKYCReviewEmbeddedLink).not.toHaveBeenCalled();

        // When the page closes
        unmount();

        // Then the link is cleared, since it carries a token
        expect(clearWiseKYCReviewEmbeddedLink).toHaveBeenCalledTimes(1);
    });
});
