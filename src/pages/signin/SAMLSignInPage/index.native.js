import React, {useCallback, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import WebView from 'react-native-webview';
import ONYXKEYS from '../../../ONYXKEYS';
import CONFIG from '../../../CONFIG';
import * as Session from '../../../libs/actions/Session';
import SAMLLoadingIndicator from '../../../components/SAMLLoadingIndicator';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';

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
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`;

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
                return;
            }
        },
        [credentials.login],
    );
    return (
        <WebView
            originWhitelist={['https://*']}
            source={{uri: samlLoginURL}}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState
            renderLoading={() => <SAMLLoadingIndicator />}
            onNavigationStateChange={handleNavigationStateChange}
        />
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
