import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps as validateLinkDefaultProps, propTypes as validateLinkPropTypes} from './validateLinkPropTypes';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** The credentials of the person logging in */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),
};

const defaultProps = {
    route: validateLinkDefaultProps,
    session: {
        authToken: null,
    },
    credentials: {},
};

function ValidateLoginPage(props) {
    useEffect(() => {
        const accountID = lodashGet(props.route.params, 'accountID', '');
        const validateCode = lodashGet(props.route.params, 'validateCode', '');

        if (lodashGet(props, 'session.authToken')) {
            // If already signed in, do not show the validate code if not on web,
            // because we don't want to block the user with the interstitial page.
            Navigation.goBack(false);
        } else {
            Session.signInWithValidateCodeAndNavigate(accountID, validateCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullScreenLoadingIndicator />;
}

ValidateLoginPage.defaultProps = defaultProps;
ValidateLoginPage.displayName = 'ValidateLoginPage';
ValidateLoginPage.propTypes = propTypes;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
