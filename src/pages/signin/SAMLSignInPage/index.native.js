import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
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

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),

    /** State of the logging in user's account */
    account: PropTypes.shape({
        /** Whether the account is loading */
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    credentials: {},
    account: {},
};

function SAMLSignInPage({credentials, account}) {
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}&platform=${getPlatform()}`;
    const [showNavigation, shouldShowNavigation] = useState(true);

    /**
     * Handles in-app navigation once we get a response back from Expensify
     *
     * @param {String} params.url
     */
    const handleNavigationStateChange = useCallback(
        ({url}) => {
            Log.info('SAMLSignInPage - Handling SAML navigation change');
            // If we've gotten a callback then remove the option to navigate back to the sign in page
            if (url.includes('loginCallback')) {
                shouldShowNavigation(false);
            }

            const searchParams = new URLSearchParams(new URL(url).search);
            if (searchParams.has('shortLivedAuthToken') && !account.isLoading) {
                Log.info('SAMLSignInPage - Successfully received shortLivedAuthToken. Signing in...');
                const shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
                Session.signInWithShortLivedAuthToken(credentials.login, shortLivedAuthToken);
            }

            // If the login attempt is unsuccessful, set the error message for the account and redirect to sign in page
            if (searchParams.has('error')) {
                Session.clearSignInData();
                Session.setAccountError(searchParams.get('error'));
                Navigation.navigate(ROUTES.HOME);
            }
        },
        [credentials.login, shouldShowNavigation, account.isLoading],
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
                        Navigation.navigate(ROUTES.HOME);
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

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;
SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SAMLSignInPage);
