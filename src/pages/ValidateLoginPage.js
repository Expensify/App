import {Component} from 'react';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import {validateLogin} from '../libs/actions/User';

const propTypes = {
    /* Onyx Props */

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: {
        params: {},
    },
};
class ValidateLoginPage extends Component {
    constructor(props) {
        super(props);

        this.needsTwoFactorAuthenticationCode = lodashGet(this.props.route.params, '2fa') === 'true';
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');

        // If there is no need to get a 2fa code, then validate the login right away, otherwise there will be a UI
        // displayed for the user to enter their 2fa code.
        if (!this.needsTwoFactorAuthenticationCode) {
            validateLogin(accountID, validateCode);
        }
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        if (!this.needsTwoFactorAuthenticationCode) {
            return null;
        }
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;
export default ValidateLoginPage;
