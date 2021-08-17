import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import SCREENS from '../SCREENS';
import {continueSessionFromECom} from '../libs/actions/Session';
import {create} from '../libs/actions/Policy';
import Permissions from '../libs/Permissions';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';

const propTypes = {
    /* Onyx Props */

    /** The data about the current session */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
    betas: [],
};
class LoginWithValidateCodePage extends Component {
    componentDidMount() {
        // If the user has an active session already, they need to be redirected straight to the relevant page
        if (this.props.session.authToken) {
            // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
            // modal you say? I know, it confuses me too. Without dismissing the current modal, if the user cancels out
            // of the new workspace modal, then they will be routed back to
            // /v/<accountID>/<validateCode>/workspace/123/card and we don't want that. We want them to go back to `/`
            // and by calling dismissModal(), the /v/... route is removed from history so the user will get taken to `/`
            // if they cancel out of the new workspace modal.
            Navigation.dismissModal();
            if (Permissions.canUseFreePlan(this.props.betas)) {
                this.rerouteToRelevantPage();
            }
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        continueSessionFromECom(accountID, validateCode);
    }

    componentDidUpdate() {
        // Betas can be loaded a little after a user is authenticated, so check again if the betas have been updated
        if (this.props.session.authToken && Permissions.canUseFreePlan(this.props.betas)) {
            this.rerouteToRelevantPage();
        }
    }

    rerouteToRelevantPage() {
        // Since all validate code login routes lead to this component, redirect to the appropriate page based on
        // the original route.
        switch (this.props.route.name) {
            case SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD:
                Navigation.navigate(ROUTES.getWorkspaceCardRoute(this.props.route.params.policyID));
                break;

            case SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE:
                // Creating a policy will reroute the user to the settings page afterwards
                create();
                break;

            default:
                Navigation.navigate(ROUTES.HOME);
                break;
        }
    }

    render() {
        // Show a loader so that the user isn't immediately kicked to the home page before rerouteToRelevantPage runs
        return <FullScreenLoadingIndicator />;
    }
}

LoginWithValidateCodePage.propTypes = propTypes;
LoginWithValidateCodePage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(LoginWithValidateCodePage);
