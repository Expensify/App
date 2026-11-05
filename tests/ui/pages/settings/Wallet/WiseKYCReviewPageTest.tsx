import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getWiseKYCReviewEmbeddedLink} from '@libs/actions/Wise';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import openExternalLink from '@libs/openExternalLink';

import WiseKYCReviewPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/WiseKYCReviewPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {WebViewProps} from 'react-native-webview';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View as MockView} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../../../../utils/TestHelper';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';
import {mockKYCReviewLinkResponse} from '../../../../utils/WiseTestUtils';

const BANK_ACCOUNT_ID = 9053192;
const BACK_PATH = 'settings/wallet/global-reimbursements/9053192/more-info-needed';
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
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/wallet/global-reimbursements/9053192/more-info-needed'));

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

let mockFetch: ReturnType<typeof TestHelper.getGlobalFetchMock>;
let originalFetch: typeof global.fetch;

/** Opens the page with the link fetched from the mocked server, as "More info needed" does before it navigates here */
async function renderPage() {
    mockKYCReviewLinkResponse(mockFetch, KYC_REVIEW_URL);
    getWiseKYCReviewEmbeddedLink(BANK_ACCOUNT_ID);
    await waitForBatchedUpdates();
    render(
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
        originalFetch = global.fetch;
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
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

    it('keeps the form open when an iframe in the form loads a URL with a status param', async () => {
        // Given Wise's form is open
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        await renderPage();

        // When an iframe on Wise's page loads a non-Wise URL with a status param, which iOS reports with isTopFrame false
        const shouldLoad = startLoading('https://www.expensify.com/wise-kyc?status=success', false);

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
