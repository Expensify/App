import type {WebBrowserAuthSessionResult} from 'expo-web-browser';
import {openAuthSessionAsync} from 'expo-web-browser';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {handleSAMLLoginError, postSAMLLogin} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {clearSignInData, setAccountError, signInWithShortLivedAuthToken} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SAMLSignInPage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: false});
    const [showNavigation, shouldShowNavigation] = useState(true);
    const [SAMLUrl, setSAMLUrl] = useState('');
    const {translate} = useLocalize();
    const hasOpenedAuthSession = useRef(false);

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

            if (!jsonParam) {
                Log.hmmm('SAMLSignInPage - No JSON parameter found in callback URL');
                return;
            }

            let shortLivedAuthToken: string | null = null;
            let error: string | null = null;

            try {
                const decodedData = JSON.parse(jsonParam) as Record<string, string | null>;
                shortLivedAuthToken = decodedData.shortLivedAuthToken ?? null;
                error = decodedData.error ?? null;
                Log.info('SAMLSignInPage - Parsed data from JSON parameter');
            } catch {
                // We need to come generate translation for message indicating parsing error
                Log.hmmm(`SAMLSignInPage - Failed to parse JSON parameter`);
                error = 'Failed to parse JSON';
            }

            if (!account?.isLoading && credentials?.login && !!shortLivedAuthToken) {
                Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
                signInWithShortLivedAuthToken(shortLivedAuthToken, true);
                return;
            }

            if (error) {
                clearSignInData();
                setAccountError(error);

                Navigation.isNavigationReady().then(() => {
                    // We must call goBack() to remove the /transition route from history
                    Navigation.goBack();
                    Navigation.navigate(ROUTES.HOME);
                });
            }
        },
        [credentials?.login, shouldShowNavigation, account?.isLoading],
    );

    useEffect(() => {
        // Don't open auth session more than once. If user cancels it we should navigate back to ROUTES.HOME
        if (!SAMLUrl || hasOpenedAuthSession.current) {
            return;
        }
        hasOpenedAuthSession.current = true;
        openAuthSessionAsync(SAMLUrl, CONST.SAML_REDIRECT_URL).then((response: WebBrowserAuthSessionResult) => {
            if (response.type !== 'success') {
                Navigation.goBack();
                return;
            }
            handleNavigationStateChange(response.url);
        });
    }, [SAMLUrl, handleNavigationStateChange]);

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
                    onBackButtonPress={() => {
                        clearSignInData();
                        Navigation.isNavigationReady().then(() => {
                            Navigation.goBack();
                        });
                    }}
                />
            )}
            <FullPageOfflineBlockingView>
                <SAMLLoadingIndicator />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default SAMLSignInPage;
