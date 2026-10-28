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

import {clearSignInData, setAccountError, setIsAuthenticatingWithShortLivedToken, signInWithShortLivedAuthToken} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {SeverityLevel} from '@sentry/react-native';
import type {WebBrowserAuthSessionResult} from 'expo-web-browser';
import type {AppStateStatus} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {dismissAuthSession, openAuthSessionAsync} from 'expo-web-browser';
import React, {useCallback, useEffect, useRef, useState} from 'react';

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
    const [session] = useOnyx(ONYXKEYS.SESSION);
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

    useAppState({
        onAppStateChange: (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background') {
                backgroundedAt.current = Date.now();
                addBreadcrumb('background', {authSessionOpen: isAuthSessionOpen.current});
                return;
            }
            if (nextAppState !== 'active' || backgroundedAt.current === null) {
                return;
            }
            lastBackgroundMs.current = Date.now() - backgroundedAt.current;
            backgroundedAt.current = null;
            addBreadcrumb('foreground', {elapsedMs: lastBackgroundMs.current, authSessionOpen: isAuthSessionOpen.current});
        },
    });

    // An in-app browser left open blocks the next sign-in attempt from opening one, and only iOS can close it.
    const dismissOpenAuthSession = (reason: AuthSessionDismissReason) => {
        if (!isAuthSessionOpen.current || getPlatform() !== CONST.PLATFORM.IOS) {
            return false;
        }
        isAuthSessionOpen.current = false;
        addBreadcrumb('dismiss', {reason, openForMs: msSince(authSessionOpenedAt.current)});
        dismissAuthSession();
        return true;
    };

    const handleExitSAMLFlow = useCallback(
        (reason: ExitSAMLFlowReason) => {
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
        },
        [dismissOpenAuthSession],
    );

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
    const handleNavigationStateChange = useCallback(
        (url: string) => {
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
                        Log.hmmm('SAMLSignInPage - SAML login returned error', {error: decodedData.error});
                    }
                } catch (parseError) {
                    Log.hmmm('SAMLSignInPage - Failed to parse JSON parameter', {error: parseError});
                }
            } else {
                Log.hmmm('SAMLSignInPage - No JSON parameter found in callback URL');
            }

            // A forced re-auth leaves account.isLoading true until sign-in, so the token alone decides here.
            if (credentials?.login && shortLivedAuthToken) {
                Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
                signInWithShortLivedAuthToken(shortLivedAuthToken, session?.authToken, true, lastVisitedPath, credentials?.login).catch((error) => {
                    Log.hmmm('SAMLSignInPage - Failed to sign in with shortLivedAuthToken', {error});
                });
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
        },
        [credentials?.login, lastVisitedPath, translate, session?.authToken],
    );

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
        addBreadcrumb('open');
        openAuthSessionAsync(SAMLUrl, CONST.SAML_REDIRECT_URL)
            .then((response: WebBrowserAuthSessionResult) => {
                isAuthSessionOpen.current = false;
                addBreadcrumb('result', {type: response.type, openForMs: msSince(authSessionOpenedAt.current), lastBackgroundMs: lastBackgroundMs.current});
                if (response.type !== 'success') {
                    // The auth session closed without handing a callback URL back to the app (e.g. the in-app browser
                    // was dismissed/cancelled, or the redirect to the custom scheme never fired). Log the result type so
                    // we can distinguish "browser never returned a success result" from "returned but had no token"
                    // (which is already logged in handleNavigationStateChange) when debugging SAML sign-in loops.
                    Log.hmmm('SAMLSignInPage - Auth session closed without a successful result', {type: response.type});
                    handleExitSAMLFlow('cancel');
                    return;
                }
                handleNavigationStateChange(response.url);
            })
            .catch((error: unknown) => {
                isAuthSessionOpen.current = false;
                addBreadcrumb('error', {message: error instanceof Error ? error.message : String(error), openForMs: msSince(authSessionOpenedAt.current)}, 'warning');
                Log.hmmm('SAML sign in failed', {error});
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
