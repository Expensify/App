import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import ROUTES from '../../ROUTES';
import * as User from '../../libs/actions/User';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';
import Navigation from '../../libs/Navigation/Navigation';

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
};

const defaultProps = {
    route: validateLinkDefaultProps,
    betas: [],
    session: {
        authToken: null,
    },
};

class ValidateLoginPage extends Component {
    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (Permissions.canUsePasswordlessLogins(this.props.betas)) {
            if (lodashGet(this.props, 'session.authToken')) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                Navigation.goBack(false);
            } else {
                Session.signInWithValidateCode(accountID, validateCode);
            }
        } else {
            User.validateLogin(accountID, validateCode);
        }
    }

    componentDidUpdate() {
        if (
            lodashGet(this.props, 'credentials.login', null)
            || !lodashGet(this.props, 'credentials.accountID', null)
            || !lodashGet(this.props, 'account.requiresTwoFactorAuth', false)
        ) {
            return;
        }

        // The user clicked the option to sign in the current tab
        Navigation.navigate(ROUTES.REPORT);
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default withOnyx({
    betas: {key: ONYXKEYS.BETAS},
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
