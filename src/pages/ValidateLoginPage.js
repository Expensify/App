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

const propTypes = {
    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: validateLinkDefaultProps,
};
class ValidateLoginPage extends Component {
    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');

        if(!this.isPasswordlessFlow()) {
            User.validateLogin(accountID, validateCode);
        }
    }

    isPasswordlessFlow() {
        return this.props.betas.includes(CONST.BETAS.PASSWORDLESS);
    }

    render() {
        return (this.isPasswordlessFlow() ? <MagicCodeModal/> : <FullScreenLoadingIndicator />);
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;

export default compose(
    withBetas(),
)(ValidateLoginPage);
