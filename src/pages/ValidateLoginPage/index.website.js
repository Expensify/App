import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import MagicCodeModal from '../../components/MagicCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    route: validateLinkDefaultProps,
    betas: [],
};

class ValidateLoginPage extends Component {
    componentDidMount() {
        // Validate login if
        // - The user is not on passwordless beta
        if (!this.isOnPasswordlessBeta()) {
            User.validateLogin(this.accountID(), this.validateCode());
            return;
        }

        // Sign in if
        // - The user is on the passwordless beta
        // - AND the user is not authenticated
        // - AND the user has initiated the sign in process in another tab
        if (this.isOnPasswordlessBeta() && !this.isAuthenticated() && this.isSignInInitiated()) {
            Session.signInWithValidateCode(this.accountID(), this.validateCode());
        }
    }

    /**
     * @returns {Boolean}
     */
    isOnPasswordlessBeta = () => Permissions.canUsePasswordlessLogins(this.props.betas);

    /**
     * @returns {String}
     */
    accountID = () => lodashGet(this.props.route.params, 'accountID', '');

    /**
     * @returns {String}
     */
    validateCode = () => lodashGet(this.props.route.params, 'validateCode', '');

    /**
     * @returns {Boolean}
     */
    isAuthenticated = () => Boolean(lodashGet(this.props, 'session.authToken', null));

    /**
     * Where SignIn was initiated on the current browser.
     * @returns {Boolean}
     */
    isSignInInitiated = () => !this.isAuthenticated() && this.props.credentials && this.props.credentials.login;

    render() {
        return (
            this.isOnPasswordlessBeta() ?
                <MagicCodeModal code={this.validateCode()}
                    shouldShowSignInHere={!this.isSignInInitiated()}
                    onSignInHereClick={() => Session.signInWithValidateCodeAndNavigate(this.accountID(), this.validateCode())}
                />
                : <FullScreenLoadingIndicator />
        );
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default withOnyx({
    betas: {key: ONYXKEYS.BETAS},
    session: {key: ONYXKEYS.SESSION},
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(ValidateLoginPage);
