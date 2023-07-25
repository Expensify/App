import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from './validateLinkPropTypes';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ValidateCodeModal from '../../components/ValidateCode/ValidateCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import useLocalize from '../../hooks/useLocalize';
import ExpiredValidateCodeModal from '../../components/ValidateCode/ExpiredValidateCodeModal';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import JustSignedInModal from '../../components/ValidateCode/JustSignedInModal';

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

        /** The validate code */
        validateCode: PropTypes.string,
    }),

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    route: validateLinkDefaultProps,
    session: {
        authToken: null,
    },
    credentials: {},
    account: {},
};

function ValidateLoginPage(props) {
    const {preferredLocale} = useLocalize();
    const login = lodashGet(props, 'credentials.login', null);
    const autoAuthState = lodashGet(props, 'session.autoAuthState', CONST.AUTO_AUTH_STATE.NOT_STARTED);
    const accountID = lodashGet(props.route.params, 'accountID', '');
    const validateCode = lodashGet(props.route.params, 'validateCode', '');
    const isSignedIn = Boolean(lodashGet(props, 'session.authToken', null));
    const is2FARequired = lodashGet(props, 'account.requiresTwoFactorAuth', false);
    const cachedAccountID = lodashGet(props, 'credentials.accountID', null);

    useEffect(() => {
        if (!login && isSignedIn && (autoAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN)) {
            // The user clicked the option to sign in the current tab
            Navigation.navigate(ROUTES.REPORT);
            return;
        }
        Session.initAutoAuthState(autoAuthState);

        if (isSignedIn || !login) {
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        Session.signInWithValidateCode(accountID, validateCode, preferredLocale);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (login || !cachedAccountID || !is2FARequired) {
            return;
        }

        // The user clicked the option to sign in the current tab
        Navigation.navigate(ROUTES.REPORT);
    }, [login, cachedAccountID, is2FARequired]);

    return (
        <>
            {autoAuthState === CONST.AUTO_AUTH_STATE.FAILED && <ExpiredValidateCodeModal />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && is2FARequired && !isSignedIn && <JustSignedInModal is2FARequired />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && <JustSignedInModal is2FARequired={false} />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED && (
                <ValidateCodeModal
                    accountID={accountID}
                    code={validateCode}
                />
            )}
            {autoAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN && <FullScreenLoadingIndicator />}
        </>
    );
}

ValidateLoginPage.defaultProps = defaultProps;
ValidateLoginPage.displayName = 'ValidateLoginPage';
ValidateLoginPage.propTypes = propTypes;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
