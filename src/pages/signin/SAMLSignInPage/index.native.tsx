import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';

import useAppState from '@hooks/useAppState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {postSAMLLogin} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import Visibility from '@libs/Visibility';

import {clearSignInData, setAccountError, setIsAuthenticatingWithShortLivedToken, signInWithShortLivedAuthToken} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {authTokenSelector} from '@src/selectors/Session';

import type {SeverityLevel} from '@sentry/react-native';
import type {WebBrowserAuthSessionResult} from 'expo-web-browser';
import type {AppStateStatus} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {dismissAuthSession, openAuthSessionAsync} from 'expo-web-browser';
import React, {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';

import handleSAMLLoginError from './handleSAMLLoginError';

type AuthSessionDismissReason = 'exit' | 'unmount';
type ExitSAMLFlowReason = 'cancel' | 'error' | 'back';

/**
 * Sentry breadcrumbs around the in-app auth session. The SSO sheet crashes inside its own dismissal after a long
 * background (Sentry APP-2SC), and these crumbs record the order of cancel / goBack / dismiss and how long the app was
 * backgrounded.
 */
function addBreadcrumb(message: string, data?: Record<string, string | number | boolean | undefined>, level: SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
        message: `[SAML auth session] ${message}`,
        category: CONST.TELEMETRY.BREADCRUMB_CATEGORY_SAML_AUTH_SESSION,
        level,
        data,
    });
}

function msSince(startedAt: number | null): number | undefined {
    return startedAt === null ? undefined : Date.now() - startedAt;
}

function SAMLSignInPage() {
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [authToken] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenSelector});
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const [showNavigation, shouldShowNavigation] = useState(true);
    const [SAMLUrl, setSAMLUrl] = useState('');
    const {translate} = useLocalize();
    const hasOpenedAuthSession = useRef(false);
    const isAuthSessionOpen = useRef(false);
    const hasExitedSAMLFlow = useRef(false);
    const authSessionOpenedAt = useRef<number | null>(null);
    const backgroundedAt = useRef<number | null>(null);
    const lastBackgroundMs = useRef<number | undefined>(undefined);
    const shortLivedAuthTokenWaitingForActiveApp = useRef<string | null>(null);
    const attemptID = useRef('');
    const attemptLogin = useRef<string | undefined>(undefined);
    const foregroundedAt = useRef<number | null>(null);
    const backgroundCount = useRef(0);
    const totalBackgroundMs = useRef(0);
    const wasAuthSessionOpenWhenBackgrounded = useRef(false);

    // The person is signed out while the sheet is open, so the login is what matches these logs to the server's SAML logs
    const getAuthSessionLogParams = () => ({
        attemptID: attemptID.current,
        login: attemptLogin.current,
        openForMs: msSince(authSessionOpenedAt.current),
        lastBackgroundMs: lastBackgroundMs.current,
        backgroundCount: backgroundCount.current,
        totalBackgroundMs: totalBackgroundMs.current,
    });

    const signInWithToken = (shortLivedAuthToken: string) => {
        Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...', false, getAuthSessionLogParams());
        signInWithShortLivedAuthToken(shortLivedAuthToken, authToken, true, lastVisitedPath, credentials?.login).catch((error) => {
            Log.hmmm('SAMLSignInPage - Failed to sign in with shortLivedAuthToken', {error, attemptID: attemptID.current});
        });
    };

    useAppState({
        onAppStateChange: (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background') {
                backgroundedAt.current = Date.now();
                // The token can come back from an authenticator app before the app is active, which closes the sheet first
                wasAuthSessionOpenWhenBackgrounded.current = isAuthSessionOpen.current;
                addBreadcrumb('background', {authSessionOpen: isAuthSessionOpen.current});
                return;
            }
            if (nextAppState !== CONST.APP_STATE.ACTIVE) {
                return;
            }
            if (backgroundedAt.current !== null) {
                lastBackgroundMs.current = Date.now() - backgroundedAt.current;
                backgroundedAt.current = null;
                foregroundedAt.current = Date.now();
                if (wasAuthSessionOpenWhenBackgrounded.current) {
                    backgroundCount.current += 1;
                    totalBackgroundMs.current += lastBackgroundMs.current;
                }
                addBreadcrumb('foreground', {elapsedMs: lastBackgroundMs.current, authSessionOpen: isAuthSessionOpen.current});
            }
            if (shortLivedAuthTokenWaitingForActiveApp.current) {
                const shortLivedAuthToken = shortLivedAuthTokenWaitingForActiveApp.current;
                shortLivedAuthTokenWaitingForActiveApp.current = null;
                signInWithToken(shortLivedAuthToken);
            }
        },
    });

    // An in-app browser left open blocks the next sign-in attempt from opening one, and only iOS can close it.
    const dismissOpenAuthSession = (reason: AuthSessionDismissReason) => {
        if (!isAuthSessionOpen.current || getPlatform() !== CONST.PLATFORM.IOS) {
            return false;
        }
        isAuthSessionOpen.current = false;
        addBreadcrumb('dismiss', {reason, openForMs: msSince(authSessionOpenedAt.current)});
        Log.info('SAMLSignInPage - Closing the auth session', false, {attemptID: attemptID.current, login: attemptLogin.current, reason, openForMs: msSince(authSessionOpenedAt.current)});
        dismissAuthSession();
        return true;
    };

    const handleExitSAMLFlow = (reason: ExitSAMLFlowReason) => {
        // Closing a stuck in-app browser settles its promise, which lands here a second time.
        if (hasExitedSAMLFlow.current) {
            return;
        }
        hasExitedSAMLFlow.current = true;
        dismissOpenAuthSession('exit');

        // Clear the guard we set before opening the in-app browser so we don't block future reauthentication
        setIsAuthenticatingWithShortLivedToken(false);
        Navigation.isNavigationReady().then(() => {
            addBreadcrumb('goBack', {reason, openForMs: msSince(authSessionOpenedAt.current), lastBackgroundMs: lastBackgroundMs.current});
            Navigation.goBack();
            clearSignInData();
        });
    };

    useEffect(
        () => () => {
            // Leaving the page must not leave the in-app browser open, or the next sign-in attempt cannot open one.
            addBreadcrumb('unmount', {authSessionOpen: isAuthSessionOpen.current});
            if (!dismissOpenAuthSession('unmount')) {
                return;
            }
            hasExitedSAMLFlow.current = true;

            // The exit that normally clears this guard is skipped above, and a stuck guard blocks the next SAML attempt.
            setIsAuthenticatingWithShortLivedToken(false);
        },
        [],
    );

    /**
     * Handles in-app navigation once we get a response back from Expensify
     */
    const handleNavigationStateChange = (url: string) => {
        // If we've gotten a callback then remove the option to navigate back to the sign-in page
        if (url.includes('loginCallback')) {
            shouldShowNavigation(false);
        }

        const searchParams = new URLSearchParams(new URL(url).search);
        const jsonParam = searchParams.get('json');

        let shortLivedAuthToken: string | null = null;
        if (jsonParam) {
            try {
                const decodedData = JSON.parse(jsonParam) as Record<string, string | null>;
                shortLivedAuthToken = decodedData.shortLivedAuthToken ?? null;
                if (decodedData.error) {
                    Log.hmmm('SAMLSignInPage - SAML login returned error', {...getAuthSessionLogParams(), error: decodedData.error});
                }
            } catch (parseError) {
                Log.hmmm('SAMLSignInPage - Failed to parse JSON parameter', {...getAuthSessionLogParams(), error: parseError});
            }
        } else {
            Log.hmmm('SAMLSignInPage - No JSON parameter found in callback URL', getAuthSessionLogParams());
        }

        // A forced re-auth leaves account.isLoading true until sign-in, so the token alone decides here.
        if (credentials?.login && shortLivedAuthToken) {
            // Coming back from an authenticator app hands over the token before the app is active, and iOS cancels a request sent then.
            if (!Visibility.isVisible()) {
                Log.info('SAMLSignInPage - Received shortLivedAuthToken while the app is not active. Waiting to sign in...', false, getAuthSessionLogParams());
                shortLivedAuthTokenWaitingForActiveApp.current = shortLivedAuthToken;
                return;
            }
            signInWithToken(shortLivedAuthToken);
            return;
        }

        // The browser returned but we couldn't sign in (no JSON parameter, a parse failure, or no token), so clear
        // the guard we set before opening it and send the user back to a clean state. Otherwise the guard stays
        // true, and since loginCallback URLs hide the back button and leave account.isLoading true, the user gets
        // stuck on the loading screen with future reauthenticate() calls aborting.
        setIsAuthenticatingWithShortLivedToken(false);
        clearSignInData();
        setAccountError(translate('common.error.login'));
        Navigation.isNavigationReady().then(() => {
            // We must call goBack() to remove the /transition route from history
            Navigation.goBack();
            Navigation.navigate(ROUTES.HOME);
        });
    };

    useEffect(() => {
        // Don't open auth session more than once. If user cancels it we should navigate back to ROUTES.HOME
        if (!SAMLUrl || hasOpenedAuthSession.current) {
            return;
        }
        hasOpenedAuthSession.current = true;
        // Opening the in-app browser backgrounds the app. When it returns, the app resumes and fires
        // reconnectApp() with the expired authToken, which 407s and triggers reauthenticate() -> redirectToSignIn(),
        // wiping the session before the SAML callback can sign the user back in. Setting this guard up front makes
        // reauthenticate() abort while the SAML sign-in is in progress. signInWithShortLivedAuthToken() resets it on
        // success; the cancel/error/failure paths reset it via handleExitSAMLFlow and handleNavigationStateChange.
        setIsAuthenticatingWithShortLivedToken(true);
        isAuthSessionOpen.current = true;
        authSessionOpenedAt.current = Date.now();
        // A background that ended before the sheet opened says nothing about the sheet, so it must not leak into the result/goBack crumbs.
        lastBackgroundMs.current = undefined;
        foregroundedAt.current = null;
        attemptID.current = rand64();
        addBreadcrumb('open');

        // Sent right away, so an attempt that never logs a result shows the app was closed while the sheet was open
        Log.info('SAMLSignInPage - Opening the auth session', true, getAuthSessionLogParams());
        openAuthSessionAsync(SAMLUrl, CONST.SAML_REDIRECT_URL)
            .then((response: WebBrowserAuthSessionResult) => {
                isAuthSessionOpen.current = false;
                addBreadcrumb('result', {type: response.type, openForMs: msSince(authSessionOpenedAt.current), lastBackgroundMs: lastBackgroundMs.current});
                if (response.type !== 'success') {
                    // The auth session closed without handing a callback URL back to the app (e.g. the in-app browser
                    // was dismissed/cancelled, or the redirect to the custom scheme never fired). Log the result type so
                    // we can distinguish "browser never returned a success result" from "returned but had no token"
                    // (which is already logged in handleNavigationStateChange) when debugging SAML sign-in loops.
                    const error = 'error' in response && typeof response.error === 'string' ? response.error : undefined;

                    // iOS gives the same error whoever closed the sheet, and a person can only tap Cancel while the app is in front
                    Log.hmmm('SAMLSignInPage - Auth session closed without a successful result', {
                        ...getAuthSessionLogParams(),
                        type: response.type,
                        error,
                        appState: AppState.currentState,
                        isInBackground: backgroundedAt.current !== null,
                        foregroundForMs: msSince(foregroundedAt.current),
                    });
                    handleExitSAMLFlow('cancel');
                    return;
                }
                handleNavigationStateChange(response.url);
            })
            .catch((error: unknown) => {
                isAuthSessionOpen.current = false;
                addBreadcrumb('error', {message: error instanceof Error ? error.message : String(error), openForMs: msSince(authSessionOpenedAt.current)}, 'warning');
                Log.hmmm('SAML sign in failed', {...getAuthSessionLogParams(), error});
                handleExitSAMLFlow('error');
            });
    }, [SAMLUrl, handleNavigationStateChange, handleExitSAMLFlow]);

    useEffect(() => {
        // If we don't have a valid login to pass here, direct the user back to a clean sign in state to try again
        if (!credentials?.login) {
            handleSAMLLoginError(translate('common.error.email'), true);
            return;
        }

        // If we've already gotten a url back to log into the user's Identity Provider (IdP), then don't re-fetch it
        if (SAMLUrl) {
            return;
        }

        attemptLogin.current = credentials.login;
        const body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);
        body.append('platform', getPlatform());
        body.append('useBrowser', 'true');
        postSAMLLogin(body)
            .then((response) => {
                if (!response || !response.url) {
                    handleSAMLLoginError(translate('common.error.login'), false);
                    return;
                }
                setSAMLUrl(response.url);
            })
            .catch((error: Error) => {
                handleSAMLLoginError(error.message ?? translate('common.error.login'), false);
            });
    }, [credentials?.login, SAMLUrl, translate]);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID="SAMLSignInPage"
        >
            {showNavigation && (
                <HeaderWithBackButton
                    title=""
                    onBackButtonPress={() => handleExitSAMLFlow('back')}
                />
            )}
            <FullPageOfflineBlockingView>
                <SAMLLoadingIndicator />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default SAMLSignInPage;
