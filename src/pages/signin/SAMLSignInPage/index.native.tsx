import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import type {WebViewNativeEvent} from 'react-native-webview/lib/WebViewTypes';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import getPlatform from '@libs/getPlatform';
import getUAForWebView from '@libs/getUAForWebView';
import Log from '@libs/Log';
import {fetchSAMLUrl} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SAMLSignInPage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [showNavigation, shouldShowNavigation] = useState(true);
    const [SAMLUrl, setSAMLUrl] = useState('');
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        // If we've already gotten a url back to log into the user's IdP, then don't re-fetch it
        if (SAMLUrl) {
            return;
        }

        const body = new FormData();
        body.append('email', credentials?.login ?? '');
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);
        body.append('platform', getPlatform());
        fetchSAMLUrl(body).then((response) => {
            if (response && response.url) {
                console.log("meep meep: " + JSON.stringify(response));
                setSAMLUrl(response.url);
            }
        });
    }, [credentials?.login, SAMLUrl]);

    /**
     * Handles in-app navigation once we get a response back from Expensify
     */
    const handleNavigationStateChange = useCallback(
        ({url}: WebViewNativeEvent) => {
            Log.info('SAMLSignInPage - Handling SAML navigation change');
            // If we've gotten a callback then remove the option to navigate back to the sign-in page
            if (url.includes('loginCallback')) {
                shouldShowNavigation(false);
            }

            const searchParams = new URLSearchParams(new URL(url).search);
            const shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
            if (!account?.isLoading && credentials?.login && !!shortLivedAuthToken) {
                Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
                Session.signInWithShortLivedAuthToken(shortLivedAuthToken);
            }

            // If the login attempt is unsuccessful, set the error message for the account and redirect to sign in page
            if (searchParams.has('error')) {
                Session.clearSignInData();
                Session.setAccountError(searchParams.get('error') ?? '');
                Navigation.navigate(ROUTES.HOME);
            }
        },
        [credentials?.login, shouldShowNavigation, account?.isLoading],
    );

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID={SAMLSignInPage.displayName}
        >
            {showNavigation && (
                <HeaderWithBackButton
                    title=""
                    onBackButtonPress={() => {
                        setSAMLUrl('');
                        Session.clearSignInData();
                        Navigation.isNavigationReady().then(() => {
                            Navigation.goBack();
                        });
                    }}
                />
            )}
            <FullPageOfflineBlockingView>
                {!!SAMLUrl && (
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

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default SAMLSignInPage;
