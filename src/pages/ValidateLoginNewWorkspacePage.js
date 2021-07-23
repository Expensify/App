import {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import {continueSessionFromECom, setRedirectToWorkspaceNewAfterSignIn} from '../libs/actions/Session';

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
    betas: null,
};
class ValidateLoginNewWorkspacePage extends Component {
    componentDidMount() {
        // If the user has an active session already, they need to be redirected straight to the new workspace page
        if (this.props.session.authToken) {
            // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
            // modal you say? I know, it confuses me too. Without dismissing the current modal, if they user cancels
            // out of the new workspace modal, then they will be routed back to
            // /v/<accountID>/<validateCode>/new-workspace and we don't want that. We want them to go back to `/` and
            // by calling dismissModal(), the /v/... route is removed from history so the user will get taken to `/`
            // if they cancel out of the new workspace modal.
            Navigation.dismissModal();
            if (this.props.betas) {
                Navigation.navigate(ROUTES.WORKSPACE_NEW);
            } else {
                setRedirectToWorkspaceNewAfterSignIn(true);
            }
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        continueSessionFromECom(accountID, validateCode);
    }

    render() {
        // Don't render anything here since the user is redirected to the new workspace page
        // once we've attempted to validate their login in continueSessionFromECom()
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
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(ValidateLoginNewWorkspacePage);
