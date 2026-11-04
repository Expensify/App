import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WiseKYCReviewPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseKYCReviewPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {WebViewProps} from 'react-native-webview';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View as MockView} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BACK_PATH = 'settings/wallet/global-reimbursements/9053192/more-info-needed';
const KYC_REVIEW_URL = 'https://wise-sandbox.com/embedded-flows/verification?token=abc';
const WEB_VIEW_TEST_ID = 'wise-kyc-web-view';

// The mock passes the navigation check on, so a test can fire it like the native WebView does
jest.mock('react-native-webview', () => ({
    WebView: ({onShouldStartLoadWithRequest}: WebViewProps) => (
        <MockView
            testID="wise-kyc-web-view"
            {...{onShouldStartLoadWithRequest}}
        />
    ),
}));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192/more-info-needed'));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage(url = KYC_REVIEW_URL) {
    await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url, isLoading: false});
    render(
        <OnyxListItemProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW}>
                    <Stack.Screen
                        name={SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW}
                        component={WiseKYCReviewPage}
                        initialParams={{bankAccountID: '9053192'}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

/** Asks the WebView whether it may load the URL, the way the native WebView does before each navigation */
function startLoading(url: string): unknown {
    return fireEvent(screen.getByTestId(WEB_VIEW_TEST_ID), 'shouldStartLoadWithRequest', {url});
}

describe('WiseKYCReviewPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    it('closes the form when Wise redirects to our redirect URL', async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the form ends and Wise redirects away from its site with the outcome
        const shouldLoad = startLoading('https://www.expensify.com/wise-kyc?status=success');

        // Then the redirect page does not load and the user is back on "More info needed"
        expect(shouldLoad).toBe(false);
        expect(goBackSpy).toHaveBeenCalledWith(BACK_PATH);
    });

    it("keeps the form open while the user moves between the form's pages", async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the form goes to its next page on Wise's site, even one that carries a status param
        const shouldLoad = startLoading('https://wise-sandbox.com/embedded-flows/verification/documents?status=success');

        // Then the page loads and the form stays open
        expect(shouldLoad).toBe(true);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    it('keeps the form open when the redirect carries a status Wise does not document', async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When a page outside Wise's site carries an unknown status
        const shouldLoad = startLoading('https://www.expensify.com/wise-kyc?status=pending');

        // Then it is not treated as the end of the form
        expect(shouldLoad).toBe(true);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    it('does not show a link outside Wise', async () => {
        // Given the server sends a link that does not point to Wise
        await renderPage('https://wise.example.com/embedded-flows/verification?token=abc');

        // Then no WebView shows it
        expect(screen.queryByTestId(WEB_VIEW_TEST_ID)).toBeNull();
    });
});
