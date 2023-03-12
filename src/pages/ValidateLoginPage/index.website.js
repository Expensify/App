import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import compose from '../../libs/compose';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ValidateCodeModal from '../../components/ValidateCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
    betas: [],
};

class ValidateLoginPage extends Component {
    constructor(props) {
        super(props);

        const authToken = lodashGet(this.props, 'session.authToken');
        this.state = {
            authState: authToken
                ? CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.COMPLETE
                : CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.NOT_STARTED,
        };
    }

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

    componentDidUpdate(prevProps) {
        if (lodashGet(this.props, 'account.requiresTwoFactorAuth') && !lodashGet(prevProps, 'account.requiresTwoFactorAuth')) {
            this.setState({authState: CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.TWO_FACTOR_AUTH});
            return;
        }

        if (!lodashGet(prevProps, 'session.authToken') || lodashGet(prevProps, 'session.authToken')) {
            return;
        }

        this.setState({authState: CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.COMPLETE});
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
     * Whether SignIn was initiated on the current browser.
     * @returns {Boolean}
     */
    isSignInInitiated = () => !this.isAuthenticated() && lodashGet(this.props, 'credentials.login', null);

    /**
     * @returns {Boolean}
     */
    requiresTwoFactorAuth = () => lodashGet(this.props, 'account.requiresTwoFactorAuth', false);

    render() {
        return (
            this.isOnPasswordlessBeta() && !lodashGet(this.props, 'account.isLoading', true) && (!this.isSignInInitiated() || (this.requiresTwoFactorAuth() && !this.isAuthenticated()))
                ? (
                    <ValidateCodeModal
                        isSuccessfullySignedIn={this.state.authState === CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.COMPLETE}
                        isTwoFactorAuthRequired={this.state.authState === CONST.VALIDATE_LOGIN_PAGE.AUTH_STATE.TWO_FACTOR_AUTH}
                        code={this.validateCode()}
                        shouldShowSignInHere={!this.isAuthenticated() && !this.isSignInInitiated()}
                        onSignInHereClick={() => Session.signInWithValidateCodeAndNavigate(this.accountID(), this.validateCode())}
                    />
                )
                : <FullScreenLoadingIndicator />
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
