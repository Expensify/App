import {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import validateLinkPropTypes from './validateLinkPropTypes';
import {validateLogin} from '../libs/actions/User';
import compose from '../libs/compose';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The data about the current session */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
};
class ValidateLoginNewWorkspacePage extends Component {
    componentDidMount() {
        console.log('1');
        // const accountID = lodashGet(this.props.route.params, 'accountID', '');
        // const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        //
        // validateLogin(accountID, validateCode);
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        return null;
    }
}

ValidateLoginNewWorkspacePage.propTypes = propTypes;
ValidateLoginNewWorkspacePage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ValidateLoginNewWorkspacePage);
