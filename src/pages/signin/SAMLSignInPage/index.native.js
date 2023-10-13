import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
import CONFIG from '../../../CONFIG';
import WebView from 'react-native-webview';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as Session from '../../../libs/actions/Session';

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

const renderLoading = () => <FullScreenLoadingIndicator />;

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
                return;
            }
        },
        [webViewRef],
    );
    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['https://*']}
            source={{uri: samlLoginURL}}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState
            renderLoading={renderLoading}
            onNavigationStateChange={handleNavigationStateChange}
        />
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
