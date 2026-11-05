import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import openExternalLink from '@libs/openExternalLink';

import WiseKYCReviewPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseKYCReviewPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {WebViewProps} from 'react-native-webview';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View as MockView} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const BACK_PATH = createDynamicRoute(
    DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path,
    createDynamicRoute(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.getRoute(9053192), ROUTES.SETTINGS_WALLET),
);
const KYC_REVIEW_URL = 'https://wise-sandbox.com/embedded-flows/verification?token=abc';
const WEB_VIEW_TEST_ID = 'wise-kyc-web-view';
const TERMS_URL = 'https://wise.com/legal/terms';

// The mock passes the navigation check and the new window event on, so a test can fire them like the native WebView does
jest.mock('react-native-webview', () => ({
    WebView: ({onShouldStartLoadWithRequest, onOpenWindow}: WebViewProps) => (
        <MockView
            testID="wise-kyc-web-view"
            {...{onShouldStartLoadWithRequest, onOpenWindow}}
        />
    ),
}));
jest.mock('@libs/openExternalLink', () => jest.fn());
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192/status'));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

async function renderPage() {
    await Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {url: KYC_REVIEW_URL, isLoading: false});
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
function startLoading(url: string, isTopFrame?: boolean): unknown {
    return fireEvent(screen.getByTestId(WEB_VIEW_TEST_ID), 'shouldStartLoadWithRequest', {url, isTopFrame});
}

describe('WiseKYCReviewPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    it.each(['success', 'closed'])('goes back to the status page with the outcome when the form ends as %s', async (status) => {
        // Given Wise's form is open over the status page
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the form ends and Wise redirects to the status page on our site
        const shouldLoad = startLoading(`${CONST.NEW_EXPENSIFY_URL}/${BACK_PATH}?status=${status}`);

        // Then the redirect page does not load, and the status page underneath gets the outcome to apply, like after Wise's redirect on web
        expect(shouldLoad).toBe(false);
        expect(goBackSpy).toHaveBeenCalledWith(`${BACK_PATH}?status=${status}`, {compareParams: false});
    });

    it('goes back to the full status path when the status page opened without the intro underneath', async () => {
        // Given the form opened over a status page that the Wallet opened, so the path rebuilt from the stack has no bank account
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        jest.mocked(useDynamicBackPath).mockReturnValue(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, ROUTES.SETTINGS_WALLET));

        try {
            await renderPage();

            // When the form ends and Wise redirects to the status page on our site
            startLoading(`${CONST.NEW_EXPENSIFY_URL}/${BACK_PATH}?status=success`);

            // Then the status page gets the outcome at a path built over the Wallet, since a path without the bank account opens "not found"
            expect(goBackSpy).toHaveBeenCalledWith(`${BACK_PATH}?status=success`, {compareParams: false});
        } finally {
            // The mock is module-level, so the other tests get the status path back even if an assertion fails
            jest.mocked(useDynamicBackPath).mockReturnValue(BACK_PATH);
        }
    });

    it.each([
        ["the form's next page on Wise's site", 'https://wise-sandbox.com/embedded-flows/verification/documents?status=success'],
        ['a link to another site', 'https://www.example.com/help?status=success'],
    ])('keeps the form open when it goes to %s, even with a status param', async (_, url) => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the form goes somewhere other than our site
        const shouldLoad = startLoading(url);

        // Then the page loads and the form stays open
        expect(shouldLoad).toBe(true);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    it('keeps the form open when an iframe in the form loads our redirect URL with a status param', async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When an iframe on Wise's page loads a URL on our site with a status param, which iOS reports with isTopFrame false
        const shouldLoad = startLoading(`${CONST.NEW_EXPENSIFY_URL}/${BACK_PATH}?status=success`, false);

        // Then the iframe loads and the form stays open, since only the top page's redirect ends the form
        expect(shouldLoad).toBe(true);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    it('opens a link that asks for a new window in the browser and keeps the form open', async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When the user taps a link in the form that opens a new window, such as Wise's terms
        fireEvent(screen.getByTestId(WEB_VIEW_TEST_ID), 'openWindow', {nativeEvent: {targetUrl: TERMS_URL}});

        // Then the link opens in the browser, since the screen has no way back from a page that replaces the form, and the form stays open
        expect(openExternalLink).toHaveBeenCalledWith(TERMS_URL);
        expect(goBackSpy).not.toHaveBeenCalled();
    });
});
