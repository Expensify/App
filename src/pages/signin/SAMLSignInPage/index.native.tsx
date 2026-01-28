import React, {useCallback, useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import type {WebViewNativeEvent} from 'react-native-webview/lib/WebViewTypes';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getPlatform from '@libs/getPlatform';
import getUAForWebView from '@libs/getUAForWebView';
import Log from '@libs/Log';
import {handleSAMLLoginError, postSAMLLogin} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {clearSignInData, setAccountError, signInWithShortLivedAuthToken} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SAMLSignInPage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: false});
    const [showNavigation, shouldShowNavigation] = useState(true);
    const [SAMLUrl, setSAMLUrl] = useState('');
    const webViewRef = useRef<WebView>(null);
    const {translate} = useLocalize();

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

    /**
     * Handles in-app navigation once we get a response back from Expensify
     */
    const handleNavigationStateChange = useCallback(
        ({url}: WebViewNativeEvent) => {
            // If we've gotten a callback then remove the option to navigate back to the sign-in page
            if (url.includes('loginCallback')) {
                shouldShowNavigation(false);
            }

            const searchParams = new URLSearchParams(new URL(url).search);
            const shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
            if (!account?.isLoading && credentials?.login && !!shortLivedAuthToken) {
                Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
                signInWithShortLivedAuthToken(shortLivedAuthToken, true);
            }

            // If the login attempt is unsuccessful, set the error message for the account and redirect to sign in page
            if (searchParams.has('error')) {
                clearSignInData();
                setAccountError(searchParams.get('error') ?? '');

                Navigation.isNavigationReady().then(() => {
                    // We must call goBack() to remove the /transition route from history
                    Navigation.goBack();
                    Navigation.navigate(ROUTES.INBOX);
                });
            }
        },
        [credentials?.login, shouldShowNavigation, account?.isLoading],
    );

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
                {!SAMLUrl ? (
                    <SAMLLoadingIndicator />
                ) : (
                    <WebView
                        ref={webViewRef}
                        originWhitelist={['https://*']}
                        source={{uri: SAMLUrl}}
                        userAgent={getUAForWebView()}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        startInLoadingState
                        renderLoading={() => <SAMLLoadingIndicator />}
                        onNavigationStateChange={handleNavigationStateChange}
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default SAMLSignInPage;
