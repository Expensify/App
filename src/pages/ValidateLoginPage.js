import {Component} from 'react';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import {validateLogin} from '../libs/actions/User';

const propTypes = {
    /* Onyx Props */

    // The accountID and validateCode are passed via the URL
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: {
        params: {},
    },
};
class ValidateLoginPage extends Component {
    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        validateLogin(accountID, validateCode);
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        return null;
    }
}

ValidateLoginPage.propTypes = propTypes;
ValidateLoginPage.defaultProps = defaultProps;
export default ValidateLoginPage;
