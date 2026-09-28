import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import getPlatform from '@libs/getPlatform';
import {postSAMLLogin} from '@libs/LoginUtils';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';

import SAMLSignInPage from '@pages/signin/SAMLSignInPage/index.native';

import {clearSignInData, setIsAuthenticatingWithShortLivedToken, signInWithShortLivedAuthToken} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {dismissAuthSession, openAuthSessionAsync, WebBrowserResultType} from 'expo-web-browser';
import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
    dismissAuthSession: jest.fn(),
    WebBrowserResultType: {CANCEL: 'cancel'},
}));

jest.mock('@libs/getPlatform', () => jest.fn());

jest.mock('@libs/LoginUtils', () => ({
    postSAMLLogin: jest.fn(),
    handleSAMLLoginError: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    clearSignInData: jest.fn(),
    setAccountError: jest.fn(),
    setIsAuthenticatingWithShortLivedToken: jest.fn(),
    signInWithShortLivedAuthToken: jest.fn(),
}));

const mockedOpenAuthSessionAsync = jest.mocked(openAuthSessionAsync);
const mockedPostSAMLLogin = jest.mocked(postSAMLLogin);
const mockedGetPlatform = jest.mocked(getPlatform);

const callbackURL = `${CONST.SAML_REDIRECT_URL}?json=${encodeURIComponent(JSON.stringify({shortLivedAuthToken: 'token'}))}`;

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

const renderPage = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <RootStack.Navigator>
                        <RootStack.Screen
                            name={SCREENS.SAML_SIGN_IN}
                            component={SAMLSignInPage}
                        />
                    </RootStack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('SAMLSignInPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
        // postSAMLLogin resolves with the parsed JSON body, and the page only reads its url.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        mockedPostSAMLLogin.mockResolvedValue({url: 'https://idp.example.com/sso'} as Response);
        mockedOpenAuthSessionAsync.mockResolvedValue({type: 'success', url: callbackURL});
        jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        jest.spyOn(Navigation, 'isNavigationReady').mockResolvedValue(undefined);
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.CREDENTIALS]: {login: 'user@saml.example.com'},
                [ONYXKEYS.ACCOUNT]: {isLoading: false},
                [ONYXKEYS.LAST_VISITED_PATH]: '/search?q=status:outstanding',
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('closes an in-app browser that never came back when the user goes back', async () => {
        // Given an in-app browser on iOS that opened and never returned a result
        mockedOpenAuthSessionAsync.mockReturnValue(new Promise(() => {}));
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(mockedOpenAuthSessionAsync).toHaveBeenCalledTimes(1);

        // When the user presses back
        fireEvent.press(screen.getByLabelText(translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        // Then the browser is closed and the user leaves the page once
        expect(dismissAuthSession).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('closes an in-app browser that never came back when the page unmounts', async () => {
        // Given an in-app browser on iOS that opened and never returned a result
        mockedOpenAuthSessionAsync.mockReturnValue(new Promise(() => {}));
        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the page unmounts
        unmount();

        // Then the browser is closed and the next SAML attempt is no longer blocked
        expect(dismissAuthSession).toHaveBeenCalledTimes(1);
        expect(setIsAuthenticatingWithShortLivedToken).toHaveBeenLastCalledWith(false);
    });

    it('leaves once when the user cancels the in-app browser', async () => {
        // Given an in-app browser the user cancels
        mockedOpenAuthSessionAsync.mockResolvedValue({type: WebBrowserResultType.CANCEL});

        // When the page opens it
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then there is nothing left to close and the user leaves the page once
        expect(dismissAuthSession).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('does not try to close the in-app browser on Android', async () => {
        // Given an in-app browser on Android that opened and never returned a result
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);
        mockedOpenAuthSessionAsync.mockReturnValue(new Promise(() => {}));
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses back
        fireEvent.press(screen.getByLabelText(translateLocal('common.back')));
        await waitForBatchedUpdatesWithAct();

        // Then only the page is left, since Android cannot close the browser
        expect(dismissAuthSession).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('signs in with the token while the account is still marked loading by a forced re-auth', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: true});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', true, '/search?q=status:outstanding');
        expect(clearSignInData).not.toHaveBeenCalled();
    });

    it('signs in with the token after a sign-in the user started', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: false});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', true, '/search?q=status:outstanding');
    });
});
