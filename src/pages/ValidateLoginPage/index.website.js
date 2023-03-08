import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
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

    render() {
        return (
            this.isOnPasswordlessBeta() && !this.isSignInInitiated() && !lodashGet(this.props, 'account.isLoading', true)
                ? (
                    <ValidateCodeModal
                        isSuccessfullySignedIn={this.state.justSignedIn}
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
