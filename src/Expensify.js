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
        return (

            // TODO: Mobile does not support Beforeunload
            // <Beforeunload onBeforeunload={ActiveClientManager.removeClient}>
            <Router>
                {/* If there is ever a property for redirecting, we do the redirect here */}
                {this.state && this.state.redirectTo && <Redirect to={this.state.redirectTo} />}
                <Route path="*" render={this.recordCurrentRoute} />

                <Switch>
                    <Route path="/signin" component={SignInPage} />
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
})(Expensify);
