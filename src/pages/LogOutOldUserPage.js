import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Log from '../libs/Log';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

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
            return;
        }

        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', ''));
        if (exitTo === ROUTES.WORKSPACE_NEW) {
            // New workspace creation is handled in AuthScreens, not in its own screen
            Log.info('[LoginWithShortLivedTokenPage] exitTo is workspace/new - handling new workspace creation in AuthScreens');
            return;
        }

        // In order to navigate to a modal, we first have to dismiss the current modal. Without dismissing the current modal, if the user cancels out of the workspace modal,
        // then they will be routed back to /transition/<accountID>/<email>/<authToken>/workspace/<policyID>/card and we don't want that. We want them to go back to `/`
        // and by calling dismissModal(), the /transition/... route is removed from history so the user will get taken to `/` if they cancel out of the new workspace modal.
        Log.info('[LoginWithShortLivedTokenPage] Dismissing LoginWithShortLivedTokenPage and navigating to exitTo');
        Navigation.dismissModal();
        Navigation.navigate(exitTo);
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
