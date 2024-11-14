import React, {useCallback, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import type {WebViewNativeEvent} from 'react-native-webview/lib/WebViewTypes';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SAMLSignInPageOnyxProps, SAMLSignInPageProps} from './types';

function SAMLSignInPage({credentials, account}: SAMLSignInPageProps) {
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials?.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}&platform=${getPlatform()}`;
    const [showNavigation, shouldShowNavigation] = useState(true);

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
                        Session.clearSignInData();
                        Navigation.isNavigationReady().then(() => {
                            Navigation.goBack();
                        });
                    }}
                />
            )}
            <FullPageOfflineBlockingView>
                <WebView
                    originWhitelist={['https://*']}
                    source={{uri: samlLoginURL}}
                    incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                    startInLoadingState
                    renderLoading={() => <SAMLLoadingIndicator />}
                    onNavigationStateChange={handleNavigationStateChange}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx<SAMLSignInPageProps, SAMLSignInPageOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SAMLSignInPage);
