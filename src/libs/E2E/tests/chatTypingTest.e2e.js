import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for typing');

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting typing metrics and submitting them…');

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating to a report…`);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute('98345625'));
            }
        });
    });
};

export default test;
