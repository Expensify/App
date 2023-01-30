import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import * as User from '../libs/actions/User';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import { compose } from 'underscore';
import { withBetas } from '../components/OnyxProvider';
import CONST from '../CONST';
import MagicCodeModal from '../components/MagicCodeModal';
import { withOnyx } from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
};
class ValidateLoginPage extends Component {
    
    componentDidMount() {
        if (this.isPasswordlessFlow()) {
            if (!this.isAuthenticated()) {
                Session.signInFromMagicLink(this.accountID(), this.validateCode());
            } 
        } else {
            User.validateLogin(this.accountID(), this.validateCode());
        }
    }

    /**
     * @returns {boolean}
     */
    isAuthenticated() {
        const authToken = lodashGet(this.props, 'session.authToken', null);
        return Boolean(authToken);
    }

    accountID = () => lodashGet(this.props.route.params, 'accountID', '');

    validateCode = () => lodashGet(this.props.route.params, 'validateCode', '');

    isPasswordlessFlow = () =>  this.props.betas.includes(CONST.BETAS.PASSWORDLESS);

    render() {
        return (this.isPasswordlessFlow() ? <MagicCodeModal code={this.validateCode()}/> : <FullScreenLoadingIndicator />);
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default compose(
    withBetas(),
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ValidateLoginPage);
