import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Log from '@libs/Log';
import * as SessionUtils from '@libs/SessionUtils';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether the account data is loading */
        isLoading: PropTypes.bool,
    }),

    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: PropTypes.shape({
        /** The user's email for the current session */
        email: PropTypes.string,
    }),
};

const defaultProps = {
    account: {
        isLoading: false,
    },
    session: {
        email: null,
    },
};

// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage(props) {
    useEffect(() => {
        Linking.getInitialURL().then((transitionURL) => {
            const sessionEmail = props.session.email;
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL, sessionEmail);

            if (isLoggingInAsNewUser) {
                Session.signOutAndRedirectToSignIn();
            }

            // We need to signin and fetch a new authToken, if a user was already authenticated in NewDot, and was redirected to OldDot
            // and their authToken stored in Onyx becomes invalid.
            // This workflow is triggered while setting up VBBA. User is redirected from NewDot to OldDot to set up 2FA, and then redirected back to NewDot
            // On Enabling 2FA, authToken stored in Onyx becomes expired and hence we need to fetch new authToken
            const shouldForceLogin = lodashGet(props, 'route.params.shouldForceLogin', '') === 'true';
            if (shouldForceLogin) {
                Log.info('LogOutPreviousUserPage - forcing login with shortLivedAuthToken');
                const email = lodashGet(props, 'route.params.email', '');
                const shortLivedAuthToken = lodashGet(props, 'route.params.shortLivedAuthToken', '');
                Session.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            }
        });

        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullScreenLoadingIndicator />;
}

LogOutPreviousUserPage.propTypes = propTypes;
LogOutPreviousUserPage.defaultProps = defaultProps;
LogOutPreviousUserPage.displayName = 'LogOutPreviousUserPage';

export default withOnyx({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutPreviousUserPage);
