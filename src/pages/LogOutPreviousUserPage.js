import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
import {Linking, NativeModules} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InitialUrlContext from '@libs/InitialUrlContext';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as SessionUtils from '@libs/SessionUtils';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
    const initUrl = useContext(InitialUrlContext);
    useEffect(() => {
        Linking.getInitialURL().then((url) => {
            const sessionEmail = props.session.email;
            const transitionUrl = NativeModules.HybridAppModule ? CONST.DEEPLINK_BASE_URL + initUrl : url;
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionUrl, sessionEmail);

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

            const exitTo = lodashGet(props, 'route.params.exitTo', '');
            // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
            // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
            // which is already called when AuthScreens mounts.
            if (exitTo && exitTo !== ROUTES.WORKSPACE_NEW && !props.account.isLoading && !isLoggingInAsNewUser) {
                Navigation.isNavigationReady().then(() => {
                    // remove this screen and navigate to exit route
                    const exitUrl = NativeModules.HybridAppModule ? Navigation.parseHybridAppUrl(exitTo) : exitTo;
                    Navigation.goBack();
                    Navigation.navigate(exitUrl);
                });
            }
        });
    }, [initUrl, props]);

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
