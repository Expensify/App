import {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import validateLinkPropTypes from './validateLinkPropTypes';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

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
        // If the user has an active session already, they need to be redirected straight to the new workspace page
        if (this.props.session.authToken) {
            Navigation.navigate(ROUTES.WORKSPACE_NEW);
        }
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
