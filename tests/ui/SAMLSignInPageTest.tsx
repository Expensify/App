import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {postSAMLLogin} from '@libs/LoginUtils';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';

import SAMLSignInPage from '@pages/signin/SAMLSignInPage/index.native';

import {clearSignInData, setIsAuthenticatingWithShortLivedToken, signInWithShortLivedAuthToken} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {AppStateStatus} from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {dismissAuthSession, openAuthSessionAsync, WebBrowserResultType} from 'expo-web-browser';
import React from 'react';
import {AppState} from 'react-native';
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
    signInWithShortLivedAuthToken: jest.fn().mockResolvedValue(undefined),
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

    it('logs why the in-app browser closed without signing in', async () => {
        // Given an in-app browser that iOS closes with its reason
        const logSpy = jest.spyOn(Log, 'hmmm');
        const cancelledResult = {type: WebBrowserResultType.CANCEL, error: 'The operation couldn’t be completed. (com.apple.AuthenticationServices.WebAuthenticationSession error 1.)'};
        mockedOpenAuthSessionAsync.mockResolvedValue(cancelledResult);

        // When the page opens it
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the log keeps the reason, so a person cancelling can be told apart from iOS closing the sheet
        expect(logSpy).toHaveBeenCalledWith(
            'SAMLSignInPage - Auth session closed without a successful result',
            expect.objectContaining({type: WebBrowserResultType.CANCEL, error: cancelledResult.error}),
        );
    });

    it('logs the same attempt and login when the in-app browser opens and closes', async () => {
        // Given an in-app browser that iOS closes without a result
        const infoSpy = jest.spyOn(Log, 'info');
        const hmmmSpy = jest.spyOn(Log, 'hmmm');
        mockedOpenAuthSessionAsync.mockResolvedValue({type: WebBrowserResultType.CANCEL});

        // When the page opens it
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then both lines carry the login, which matches them to the server's SAML logs, and one attempt ID
        expect(infoSpy).toHaveBeenCalledWith('SAMLSignInPage - Opening the auth session', true, expect.objectContaining({login: 'user@saml.example.com'}));
        const openParams = infoSpy.mock.calls.find(([message]) => message === 'SAMLSignInPage - Opening the auth session')?.[2];
        const attemptID = openParams && typeof openParams === 'object' && 'attemptID' in openParams ? openParams.attemptID : undefined;
        expect(attemptID).toEqual(expect.any(String));
        expect(attemptID).not.toBe('');
        expect(hmmmSpy).toHaveBeenCalledWith('SAMLSignInPage - Auth session closed without a successful result', expect.objectContaining({attemptID, login: 'user@saml.example.com'}));
    });

    it('logs whether the app was in the background when the in-app browser closed', async () => {
        // Given an in-app browser that is still open while the person switches to another app
        const hmmmSpy = jest.spyOn(Log, 'hmmm');
        const appStateListeners: Array<(state: AppStateStatus) => void> = [];
        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
            appStateListeners.push(listener);
            return {remove: jest.fn()};
        });
        let closeAuthSession: (result: {type: typeof WebBrowserResultType.CANCEL}) => void = () => {};
        mockedOpenAuthSessionAsync.mockReturnValue(
            new Promise((resolve) => {
                closeAuthSession = resolve;
            }),
        );
        const setAppState = (state: AppStateStatus) => {
            act(() => {
                for (const listener of appStateListeners) {
                    listener(state);
                }
            });
        };
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the app goes to the background, comes back once, goes to the background again and the sheet closes there
        setAppState(CONST.APP_STATE.BACKGROUND);
        setAppState(CONST.APP_STATE.ACTIVE);
        setAppState(CONST.APP_STATE.BACKGROUND);
        await act(async () => {
            closeAuthSession({type: WebBrowserResultType.CANCEL});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the log shows the sheet closed in the background after one trip away, which a person tapping Cancel can't do
        expect(hmmmSpy).toHaveBeenCalledWith('SAMLSignInPage - Auth session closed without a successful result', expect.objectContaining({isInBackground: true, backgroundCount: 1}));

        addEventListenerSpy.mockRestore();
    });

    it('counts the trip to an authenticator app when the token comes back while the app is in the background', async () => {
        // Given an open in-app browser and a person who leaves for their authenticator app
        const infoSpy = jest.spyOn(Log, 'info');
        const appStateListeners: Array<(state: AppStateStatus) => void> = [];
        const currentStateSpy = jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.ACTIVE);
        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
            appStateListeners.push(listener);
            return {remove: jest.fn()};
        });
        let returnFromAuthSession: (result: {type: 'success'; url: string}) => void = () => {};
        mockedOpenAuthSessionAsync.mockReturnValue(
            new Promise((resolve) => {
                returnFromAuthSession = resolve;
            }),
        );
        const setAppState = (state: AppStateStatus) => {
            currentStateSpy.mockReturnValue(state);
            act(() => {
                for (const listener of appStateListeners) {
                    listener(state);
                }
            });
        };
        renderPage();
        await waitForBatchedUpdatesWithAct();
        setAppState(CONST.APP_STATE.BACKGROUND);

        // When the token comes back before the app is active again, and the app then comes back
        await act(async () => {
            returnFromAuthSession({type: 'success', url: callbackURL});
        });
        await waitForBatchedUpdatesWithAct();
        setAppState(CONST.APP_STATE.ACTIVE);

        // Then the success log counts that trip, since this is the authenticator app case the logs are for
        expect(infoSpy).toHaveBeenCalledWith('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...', false, expect.objectContaining({backgroundCount: 1}));

        currentStateSpy.mockRestore();
        addEventListenerSpy.mockRestore();
    });

    it('logs why the page closed the in-app browser itself', async () => {
        // Given an in-app browser that opened and never returned a result
        const infoSpy = jest.spyOn(Log, 'info');
        mockedOpenAuthSessionAsync.mockReturnValue(new Promise(() => {}));
        const {unmount} = renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the page unmounts
        unmount();

        // Then the log says the page closed the sheet, which iOS would otherwise report as a dismiss with no reason
        expect(infoSpy).toHaveBeenCalledWith('SAMLSignInPage - Closing the auth session', false, expect.objectContaining({reason: 'unmount', login: 'user@saml.example.com'}));
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

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', undefined, true, '/search?q=status:outstanding', 'user@saml.example.com');
        expect(clearSignInData).not.toHaveBeenCalled();
    });

    it('signs in with the token after a sign-in the user started', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {isLoading: false});
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', undefined, true, '/search?q=status:outstanding', 'user@saml.example.com');
    });
    it('waits until the app is active to sign in with a token that came back while it was in the background', async () => {
        // Given the token comes back from an authenticator app before iOS marks the app active again
        const appStateListeners: Array<(state: AppStateStatus) => void> = [];
        const currentStateSpy = jest.spyOn(AppState, 'currentState', 'get').mockReturnValue(CONST.APP_STATE.BACKGROUND);
        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
            appStateListeners.push(listener);
            return {remove: jest.fn()};
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is sent yet, since iOS cancels a request sent before the app is active
        expect(signInWithShortLivedAuthToken).not.toHaveBeenCalled();

        // When the app becomes active
        currentStateSpy.mockReturnValue(CONST.APP_STATE.ACTIVE);
        act(() => {
            for (const listener of appStateListeners) {
                listener(CONST.APP_STATE.ACTIVE);
            }
        });

        // Then it signs in once with the token it kept
        expect(signInWithShortLivedAuthToken).toHaveBeenCalledTimes(1);
        expect(signInWithShortLivedAuthToken).toHaveBeenCalledWith('token', undefined, true, '/search?q=status:outstanding', 'user@saml.example.com');

        currentStateSpy.mockRestore();
        addEventListenerSpy.mockRestore();
    });
});
