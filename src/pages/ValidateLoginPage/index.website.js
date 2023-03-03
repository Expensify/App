import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import compose from '../../libs/compose';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ValidateCodeModal from '../../components/ValidateCode/ValidateCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import AbracadabraModal from '../../components/ValidateCode/AbracadabraModal';
import ExpiredValidateCodeModal from '../../components/ValidateCode/ExpiredValidateCodeModal';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

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

        this.resendValidateCode = this.resendValidateCode.bind(this);

        this.state = {justSignedIn: false};
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
        if (!lodashGet(this.props, 'credentials.login', null) && lodashGet(this.props, 'credentials.accountID', null)) {
            // The user clicked the option to sign in the current tab
            if (lodashGet(this.props, 'account.requiresTwoFactorAuth', false)) {
                Navigation.navigate(ROUTES.HOME);
            } else {
                Navigation.navigate(ROUTES.REPORT);
            }
            return;
        }
        if (!(prevProps.credentials && !prevProps.credentials.validateCode && this.props.credentials.validateCode)) {
            return;
        }
        this.setState({justSignedIn: true});
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
     * Trigger the reset validate code flow
     */
    resendValidateCode() {
        Session.resendLinkWithValidateCode();
    }

    render() {
        const showExpiredCodeModal = this.props.account && !_.isEmpty(this.props.account.errors);
        const showAbracadabra = this.isOnPasswordlessBeta()
            && !lodashGet(this.props, 'account.isLoading', true)
            && this.state.justSignedIn;
        const showValidateCodeModal = this.isOnPasswordlessBeta()
            && !this.isSignInInitiated()
            && !lodashGet(this.props, 'account.isLoading', true)
            && !this.state.justSignedIn
            && _.isEmpty(this.props.account.errors);
        return (
            <>
                {showExpiredCodeModal && (
                    <ExpiredValidateCodeModal
                        shouldShowRequestCodeLink={lodashGet(this.props, 'credentials.login', null) != null}
                        onRequestCodeClick={this.resendValidateCode}
                    />
                )}
                {showAbracadabra && <AbracadabraModal />}
                {showValidateCodeModal && (
                    <ValidateCodeModal
                        code={this.validateCode()}
                        shouldShowSignInHere={!this.isAuthenticated() && !this.isSignInInitiated()}
                        onSignInHereClick={() => Session.signInWithValidateCode(this.accountID(), this.validateCode())}
                    />
                )}
                {!showExpiredCodeModal && !showAbracadabra && !showValidateCodeModal && <FullScreenLoadingIndicator />}
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
