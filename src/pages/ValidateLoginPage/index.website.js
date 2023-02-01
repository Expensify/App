import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {compose} from 'underscore';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import * as User from '../../libs/actions/User';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import {withBetas} from '../../components/OnyxProvider';
import CONST from '../../CONST';
import MagicCodeModal from '../../components/MagicCodeModal';
import ONYXKEYS from '../../ONYXKEYS';
import * as Session from '../../libs/actions/Session';
import Permissions from '../../libs/Permissions';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
};

class ValidateLoginPage extends Component {
    componentDidMount() {
        if (Permissions.canUsePasswordlessLogins(this.props.betas)) {
            if (!this.isAuthenticated()) {
                Session.signInFromMagicLink(this.accountID(), this.validateCode());
            }
        } else {
            User.validateLogin(this.accountID(), this.validateCode());
        }
    }

    isAuthenticated() {
        const authToken = lodashGet(this.props, 'session.authToken', null);
        return Boolean(authToken);
    }

    accountID = () => lodashGet(this.props.route.params, 'accountID', '');

    validateCode = () => lodashGet(this.props.route.params, 'validateCode', '');

    render() {
        return (Permissions.canUsePasswordlessLogins(this.props.betas) ? <MagicCodeModal code={this.validateCode()} /> : <FullScreenLoadingIndicator />);
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default withOnyx({
    betas: { key: ONYXKEYS.BETAS },
    session: { key: ONYXKEYS.SESSION },
})(ValidateLoginPage);
