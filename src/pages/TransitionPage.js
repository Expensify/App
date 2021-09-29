import React, {PureComponent} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../ROUTES';
import ONYXKEYS from '../ONYXKEYS';
import {loadBetasAndFetchPolicies} from '../libs/actions/Transition';
import {signInWithShortLivedToken} from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import Growl from '../libs/Growl';

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

class TransitionPage extends PureComponent {
    constructor(props) {
        super(props);
        this.accountID = lodashGet(this.props.route.params, 'accountID', '');;
        this.email = lodashGet(this.props.route.params, 'email', '');
        this.shortLivedToken = lodashGet(this.props.route.params, 'shortLivedToken', '');
        this.encryptedAuthToken = lodashGet(this.props.route.params, 'encryptedAuthToken', '');
    }

    componentDidMount() {
        // exitTo is URI encoded because it could contain a variable number of slashes (i.e. "workspace/new" vs "workspace/<ID>/card")
        const exitTo = decodeURIComponent(lodashGet(this.props.route.params, 'exitTo', '')) || ROUTES.HOME;
        const shouldCreateNewWorkspace = exitTo === ROUTES.WORKSPACE_NEW;

        this.signInIfNecessary()
            .then(() => loadBetasAndFetchPolicies(shouldCreateNewWorkspace))
            .then(({policyID}) => {
                // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
                // modal you say? I know, it confuses me too. Without dismissing the current modal, if the user cancels out
                // of the workspace modal, then they will be routed back to
                // /transition/<accountID>/<email>/<authToken>/workspace/<policyID>/card and we don't want that. We want them to go back to `/`
                // and by calling dismissModal(), the /transition/... route is removed from history so the user will get taken to `/`
                // if they cancel out of the new workspace modal.
                Navigation.dismissModal();
                Navigation.navigate(policyID ? ROUTES.getWorkspaceCardRoute(policyID) : ROUTES.HOME);
            })
            .catch((err) => {
                Navigation.dismissModal();
                Navigation.navigate();
                Growl.error(err);
            });
    }

    /**
     * @returns {Promise}
     */
    signInIfNecessary() {
        if (!this.props.session.authToken || this.email !== this.props.session.email) {
            return signInWithShortLivedToken(this.accountID, this.email, this.shortLivedToken, this.encryptedAuthToken);
        }
        return Promise.resolve();
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

TransitionPage.propTypes = propTypes;
TransitionPage.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(TransitionPage);
