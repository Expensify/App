import React, {useCallback, useRef} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ONYXKEYS from '../../../ONYXKEYS';
import CONFIG from '../../../CONFIG';
import * as Session from '../../../libs/actions/Session';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ScreenWrapper from '../../../components/ScreenWrapper';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import FullPageOfflineBlockingView from '../../../components/BlockingViews/FullPageOfflineBlockingView';

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

// const renderLoading = () => <FullScreenLoadingIndicator />;

function SAMLSignInPage({credentials}) {
    const webViewRef = useRef();
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`;
    /**
     * Handles in-app navigation once we get a response back from Expensify
     *
     * @param {String} params.type
     * @param {String} params.url
     */
    const handleNavigationStateChange = useCallback(
        ({type, url}) => {
            const searchParams = new URLSearchParams(new URL(url).search);
            if (searchParams.has('shortLivedAuthToken')) {
                const shortLivedAuthToken = searchParams.get('shortLivedAuthToken');
                Session.signInWithShortLivedAuthToken(credentials.login, shortLivedAuthToken);
                Navigation.navigate(ROUTES.HOME);
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
        >
            <HeaderWithBackButton
                title="SAML Sign In"
                onBackButtonPress={() => Navigation.navigate(ROUTES.HOME)}
            />
            <FullPageOfflineBlockingView>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['https://*']}
                    source={{uri: samlLoginURL}}
                    incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                    startInLoadingState
                    renderLoading={() => (
                        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading]}>
                            <ActivityIndicator
                                color={themeColors.spinner}
                                size="large"
                            />
                        </View>
                    )}
                    onNavigationStateChange={handleNavigationStateChange}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
