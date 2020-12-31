import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import {recordCurrentlyViewedReportID, recordCurrentRoute} from './libs/actions/App';
import HomePage from './pages/home/HomePage';
import NotFoundPage from './pages/NotFound';
import SetPasswordPage from './pages/SetPasswordPage';
import SignInPage from './pages/signin/SignInPage';
import listenToStorageEvents from './libs/listenToStorageEvents';
import * as ActiveClientManager from './libs/ActiveClientManager';
import ONYXKEYS from './ONYXKEYS';

import styles from './styles/styles';
import Log from './libs/Log';

import {
    Route,
    Router,
    Redirect,
    Switch
} from './libs/Router';
import ROUTES from './ROUTES';
import PushNotification from './libs/Notification/PushNotification';

// Initialize the store when the app loads for the first time
Onyx.init({
    keys: ONYXKEYS,
    safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    initialKeyStates: {

        // Clear any loading and error messages so they do not appear on app startup
        [ONYXKEYS.SESSION]: {loading: false},
        [ONYXKEYS.ACCOUNT]: {loading: false, error: ''},
    },
    registerStorageEventListener: (onStorageEvent) => {
        listenToStorageEvents(onStorageEvent);
    },
});
Onyx.registerLogger(({level, message}) => {
    if (level === 'alert') {
        Log.alert(message, 0, {}, false);
    } else {
        Log.client(message);
    }
});

const propTypes = {
    /* Onyx Props */

    // A route set by Onyx that we will redirect to if present. Always empty on app init.
    redirectTo: PropTypes.string,
};

const defaultProps = {
    redirectTo: '',
};

class Expensify extends Component {
    constructor(props) {
        super(props);

        // Initialize this client as being an active client
        ActiveClientManager.init();

        this.removeLoadingState = this.removeLoadingState.bind(this);

        this.state = {
            isLoading: true,
            authToken: null,
        };
    }

    componentDidMount() {
        Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: this.removeLoadingState,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.accountID && this.state.accountID !== prevState.accountID) {
            PushNotification.register(this.state.accountID);
        }
    }

    /**
     * When the authToken is updated, the app should remove the loading state and handle the authToken
     *
     * @param {Object} session
     * @param {String} session.authToken
     */
    removeLoadingState(session) {
        this.setState({
            authToken: session ? session.authToken : null,
            accountID: session ? session.accountID : null,
            isLoading: false,
        });
    }

    render() {
        // Until the authToken has been initialized from Onyx, display a blank page
        if (this.state.isLoading) {
            return (
                <View style={styles.genericView} />
            );
        }
        return (
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {/* Leave this as a ternary or else iOS throws an error about text not being wrapped in <Text> */}
                {this.props.redirectTo ? <Redirect push to={this.props.redirectTo} /> : null}
                <Route path="*" render={recordCurrentRoute} />

                {/* We must record the currentlyViewedReportID when hitting the 404 page so */}
                {/* that we do not try to redirect back to that report again */}
                <Route path={[ROUTES.REPORT, ROUTES.NOT_FOUND]} exact render={recordCurrentlyViewedReportID} />

                <Switch>
                    <Route
                        exact
                        path={ROUTES.ROOT}
                        render={() => (
                            this.state.authToken
                                ? <Redirect to={ROUTES.HOME} />
                                : <Redirect to={ROUTES.SIGNIN} />
                        )}
                    />

                    <Route path={[ROUTES.SET_PASSWORD]} component={SetPasswordPage} />
                    <Route path={[ROUTES.NOT_FOUND]} component={NotFoundPage} />
                    <Route path={[ROUTES.SIGNIN_WITH_EXITTO, ROUTES.SIGNIN]} component={SignInPage} />
                    <Route
                        path={[ROUTES.HOME, ROUTES.ROOT]}
                        render={match => (

                            // Need to do this for every page that the user needs to be logged in to access
                            this.state.authToken
                                ? <HomePage match={match} />
                                : <Redirect to={ROUTES.SIGNIN} />
                        )}
                    />
                </Switch>
            </Router>
        );
    }
}

Expensify.propTypes = propTypes;
Expensify.defaultProps = defaultProps;

export default withOnyx({
    redirectTo: {
        key: ONYXKEYS.APP_REDIRECT_TO,

        // Prevent the prefilling of Onyx data or else the app will always redirect to what the last value was set to.
        // This ends up in a situation where you go to a report, refresh the page, and then rather than seeing the
        // report you are brought back to the root of the site (ie. "/").
        initWithStoredValues: false,
    },
})(Expensify);
