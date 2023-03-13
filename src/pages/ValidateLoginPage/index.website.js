import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Onyx, {withOnyx} from 'react-native-onyx';
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
import CONST from '../../CONST';

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

        this.state = {autoAuth: null};
    }

    componentDidMount() {
        // Validate login if
        // - The user is not on passwordless beta
        if (!Permissions.canUsePasswordlessLogins(this.props.betas)) {
            User.validateLogin(this.getAccountID(), this.getValidateCode());
            return;
        }

        Session.initAutoAuthState();

        // Sign in if
        // - The user is on the passwordless beta
        // - AND the user is not authenticated
        // - AND the user has initiated the sign in process in another tab
        if (!lodashGet(this.props, 'session.authToken',null) && lodashGet(this.props, 'credentials.login', null)) {
            Session.signInWithValidateCode(this.getAccountID(), this.getValidateCode());
            return;
        }
    }

    componentDidUpdate(prevProps) {
        if (!lodashGet(this.props, 'credentials.login', null) && lodashGet(this.props, 'credentials.accountID', null)) {
            
            // The user clicked the option to sign in the current tab
            Navigation.navigate(ROUTES.HOME);
        }
    }

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
    getValidateCode(){
        return lodashGet(this.props.route.params, 'validateCode', '');
    }

    render() {
        return (
            <>
                {this.getAutoAuthState === CONST.AUTO_AUTH_STATE.FAILED && <ExpiredValidateCodeModal />}
                {this.getAutoAuthState() === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && <AbracadabraModal />}
                {this.getAutoAuthState() === CONST.AUTO_AUTH_STATE.NOT_STARTED  && (
                    <ValidateCodeModal
                        code={this.getValidateCode()}
                    />
                )}
            </>
        );
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        session: {key: ONYXKEYS.SESSION},
    }),
)(ValidateLoginPage);
