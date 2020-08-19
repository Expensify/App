import React, {Component} from 'react';

// import {Beforeunload} from 'react-beforeunload';
import SignInPage from './page/SignInPage';
import HomePage from './page/HomePage/HomePage';
import Ion from './lib/Ion';
import * as ActiveClientManager from './lib/ActiveClientManager';
import {verifyAuthToken} from './lib/actions/ActionsSession';
import IONKEYS from './IONKEYS';
import WithIon from './components/WithIon';
import {
    Route,
    Router,
    Redirect,
    Switch
} from './lib/Router';

// Initialize the store when the app loads for the first time
Ion.init();

class Expensify extends Component {
    constructor(props) {
        super(props);

        this.recordCurrentRoute = this.recordCurrentRoute.bind(this);

        this.state = {};
    }

    /**
     * Keep the current route match stored in Ion so other libs can access it
     *
     * @param {object} params.match
     */
    recordCurrentRoute({match}) {
        Ion.set(IONKEYS.CURRENT_URL, match.url);
    }

    render() {
        // Always enforce that re-renders of this component use the react-router Redirect component and at least have a redirectTo value
        // that goes somewhere. this.state.redirectTo will only ever be set from elsewhere in the code by Ion and can only happen after the initial render.
        // If we have no redirectTo value we'll next look at the authToken since the lack of once indicates that we need to sign in. If we have no redirectTo and we do 
        // have an authToken then we should just redirect to the root. If we don't do this then an unauthenticated user will fall through to the site root by
        // default and they will see things they aren't supposed to see.
        const redirectTo = this.state.redirectTo || (!this.state.authToken && '/signin') || '/';
        return (

            // TODO: Mobile does not support Beforeunload
            // <Beforeunload onBeforeunload={ActiveClientManager.removeClient}>
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {redirectTo && <Redirect to={redirectTo} />}
                <Route path="*" render={this.recordCurrentRoute} />

                <Switch>
                    <Route path={['/signin/exitTo/:exitTo*', '/signin']} component={SignInPage} />
                    <Route path="/" component={HomePage} />
                </Switch>
            </Router>

        // </Beforeunload>
        );
    }
}

export default WithIon({
    redirectTo: {
        key: IONKEYS.APP_REDIRECT_TO,
        loader: () => {
            // Verify that our authToken is OK to use
            verifyAuthToken();

            // Initialize this client as being an active client
            ActiveClientManager.init();
        },
    },
    authToken: {
        key: IONKEYS.SESSION,
        path: 'authToken',
        prefillWithKey: IONKEYS.SESSION,
    },
})(Expensify);
