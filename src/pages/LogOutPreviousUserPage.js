import React, {Component} from 'react';
import {Linking} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import * as SessionUtils from '../libs/SessionUtils';

const propTypes = {
    /** The data about the current session which will be set once the user is authenticated and we return to this component as an AuthScreen */
    session: PropTypes.shape({
        /** The user's email for the current session */
        email: PropTypes.string,
    }).isRequired,
};

class LogOutPreviousUserPage extends Component {
    componentDidMount() {
        Linking.getInitialURL()
            .then((transitionURL) => {
                const sessionEmail = lodashGet(this.props.session, 'email', '');
                const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(transitionURL, sessionEmail);
                if (isLoggingInAsNewUser) {
                    Session.signOutAndRedirectToSignIn();
                    return;
                }

                // Since we conditionally render navigators in the AppNavigator, when we
                // sign out and sign back in there will be a moment where no navigator
                // is rendered and the navigation state is null. We can't navigate at
                // that time, so we use a promise to delay transition navigation until
                // it is ready. We set the navigation ready here since we know that the
                // navigator is now rendered.
                Navigation.setIsNavigationReady();
            });
    }

    render() {
        return <FullScreenLoadingIndicator />;
    }
}

LogOutPreviousUserPage.propTypes = propTypes;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(LogOutPreviousUserPage);
