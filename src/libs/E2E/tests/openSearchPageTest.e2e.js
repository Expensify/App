import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for search');

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting search metrics and submitting them…');

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating to search route…`);
                Navigation.navigate(ROUTES.SEARCH);
                return;
            }

            console.debug(`[E2E] Entry: ${JSON.stringify(entry)}`);
            if (entry.name !== CONST.TIMING.SEARCH_RENDER) {
                return;
            }

            console.debug(`[E2E] Submitting!`);
            E2EClient.submitTestResults({
                name: 'Open Search Page TTI',
                duration: entry.duration,
            })
                .then(() => {
                    console.debug('[E2E] Done with search, exiting…');
                    E2EClient.submitTestDone();
                })
                .catch((err) => {
                    console.debug('[E2E] Error while submitting test results:', err);
                });
        });
    });
};

export default test;
