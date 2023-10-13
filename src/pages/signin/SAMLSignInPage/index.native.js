import React, {useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
import CONFIG from '../../../CONFIG';
import WebView from 'react-native-webview';
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

const renderLoading = () => <FullScreenLoadingIndicator />;

function SAMLSignInPage({credentials}) {
    const webViewRef = useRef();
    const samlLoginURL = `${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`;
    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['https://*']}
            source={{uri: samlLoginURL}}
            incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
            startInLoadingState
            renderLoading={renderLoading}
            onNavigationStateChange={(ref) => {console.log("meep meep navigation changed: " + JSON.stringify(ref))}}
        />
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
