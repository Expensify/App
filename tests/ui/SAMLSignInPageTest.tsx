import {act, render} from '@testing-library/react-native';

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

import {clearSignInData, signInWithShortLivedAuthToken} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {openAuthSessionAsync} from 'expo-web-browser';
import React from 'react';
import Onyx from 'react-native-onyx';

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
                [ONYXKEYS.LAST_VISITED_PATH]: '/search?q=status:outstanding',
            });
        });
        await waitForBatchedUpdatesWithAct();
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
