import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import ONYXKEYS from '../../../ONYXKEYS';
import CONFIG from '../../../CONFIG';
import * as Session from '../../../libs/actions/Session';
import SAMLLoadingIndicator from '../../../components/SAMLLoadingIndicator';
import getPlatform from '../../../libs/getPlatform';
import FullPageOfflineBlockingView from '../../../components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),
};

const defaultProps = {
    credentials: {},
};

function SAMLSignInPage({credentials}) {
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}&platform=${getPlatform()}`;

    /**
     * Handles in-app navigation once we get a response back from Expensify
     *
     * @param {String} params.url
     */
    const handleNavigationStateChange = useCallback(
        ({url}) => {
            const searchParams = new URLSearchParams(new URL(url).search);
            if (searchParams.has('shortLivedAuthToken')) {
                const shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
                Session.signInWithShortLivedAuthToken(credentials.login, shortLivedAuthToken);
            }

            if (searchParams.has('error')) {
                // Run the Onyx action to set an error state on the sign in page
                // Currently this is what's going to trigger because the backend isn't redirecting SAML correctly
                Navigation.navigate(ROUTES.HOME);
            }
        },
        [credentials.login],
    );
    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID={SAMLSignInPage.displayName}
        >
            <HeaderWithBackButton
                title=""
                onBackButtonPress={() => {
                    Session.clearSignInData();
                    Navigation.navigate(ROUTES.HOME);
                }}
            />
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
})(SAMLSignInPage);
