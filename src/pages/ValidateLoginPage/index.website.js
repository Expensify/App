import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {propTypes as validateLinkPropTypes, defaultProps as validateLinkDefaultProps} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import compose from '../../libs/compose';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ValidateCodeModal from '../../components/ValidateCode/ValidateCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ExpiredValidateCodeModal from '../../components/ValidateCode/ExpiredValidateCodeModal';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import JustSignedInModal from '../../components/ValidateCode/JustSignedInModal';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
    betas: [],
    session: {
        authToken: null,
    },
    credentials: {},
    account: {},
};

class ValidateLoginPage extends Component {
    componentDidMount() {
        const login = lodashGet(this.props, 'credentials.login', null);

        // A fresh session will not have credentials.login and user permission betas available.
        // In that case, we directly allow users to go through password less flow
        if (login && !Permissions.canUsePasswordlessLogins(this.props.betas)) {
            User.validateLogin(this.getAccountID(), this.getValidateCode());
            return;
        }

        const isSignedIn = Boolean(lodashGet(this.props, 'session.authToken', null));
        const cachedAutoAuthState = lodashGet(this.props, 'session.autoAuthState', null);
        if (!login && isSignedIn && (cachedAutoAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN || cachedAutoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN)) {
            // The user clicked the option to sign in the current tab
            Navigation.navigate(ROUTES.REPORT);
            return;
        }
        Session.initAutoAuthState(cachedAutoAuthState);

        if (isSignedIn || !login) {
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        Session.signInWithValidateCode(this.getAccountID(), this.getValidateCode(), this.props.preferredLocale);
    }

    componentDidUpdate() {
        if (lodashGet(this.props, 'credentials.login', null) || !lodashGet(this.props, 'credentials.accountID', null) || !lodashGet(this.props, 'account.requiresTwoFactorAuth', false)) {
            return;
        }

        // The user clicked the option to sign in the current tab
        Navigation.navigate(ROUTES.REPORT);
    }

    /**
     * @returns {String}
     */
    getAutoAuthState() {
        return lodashGet(this.props, 'session.autoAuthState', CONST.AUTO_AUTH_STATE.NOT_STARTED);
    }

    /**
     * @returns {String}
     */
    getAccountID() {
        return lodashGet(this.props.route.params, 'accountID', '');
    }

    /**
     * @returns {String}
     */
    getValidateCode() {
        return lodashGet(this.props.route.params, 'validateCode', '');
    }

    render() {
        const is2FARequired = lodashGet(this.props, 'account.requiresTwoFactorAuth', false);
        const isSignedIn = Boolean(lodashGet(this.props, 'session.authToken', null));
        const currentAuthState = this.getAutoAuthState();
        return (
            <>
                {currentAuthState === CONST.AUTO_AUTH_STATE.FAILED && <ExpiredValidateCodeModal />}
                {currentAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && is2FARequired && !isSignedIn && <JustSignedInModal is2FARequired />}
                {currentAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && <JustSignedInModal is2FARequired={false} />}
                {currentAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED && (
                    <ValidateCodeModal
                        accountID={this.getAccountID()}
                        code={this.getValidateCode()}
                    />
                )}
                {currentAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN && <FullScreenLoadingIndicator />}
            </>
        );
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        session: {key: ONYXKEYS.SESSION},
    }),
)(ValidateLoginPage);
