import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Log from '../libs/Log';
import Navigation from '../libs/Navigation/Navigation';

const propTypes = {
    /** The parameters needed to authenticate with a short lived token are in the URL */
    route: PropTypes.shape({
        /** The name of the route */
        name: PropTypes.string,

        /** Unique key associated with the route */
        key: PropTypes.string,

        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** AccountID associated with the validation link */
            accountID: PropTypes.string,

            /** Short lived token */
            shortLivedToken: PropTypes.string,

            /** URL to exit to */
            exitTo: PropTypes.string,
        }),
    }),

    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,

        /** The authToken for the current session */
        email: PropTypes.string,
    }),
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
};

class LogOutOldUserPage extends Component {
    componentDidMount() {
        const email = lodashGet(this.props.route.params, 'email', '');
        if (this.props.session && this.props.session.email !== email) {
            Log.info('[LogOutOldUserPage] Different user signed in - signing out');
            Session.signOutAndRedirectToSignIn();
        }

        // Set isNavigationReady so that we can navigate in the AuthScreens
        Navigation.setIsNavigationReady();
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogOutOldUserPage.propTypes = propTypes;
LogOutOldUserPage.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutOldUserPage);
