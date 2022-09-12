import React, {Component} from 'react';
import {Linking} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import * as SessionUtils from '../libs/SessionUtils';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

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
                } else {
                    const exitTo = lodashGet(this.props, 'route.params.exitTo');
                    Navigation.dismissModal();
                    Navigation.navigate(exitTo || ROUTES.HOME);
                }
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
