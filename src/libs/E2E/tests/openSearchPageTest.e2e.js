import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const test = () => {
    const email = 'applausetester+perf2@applause.expensifail.com';
    const password = 'Password123';

    console.debug('[E2E] App is ready, logging in…');

    // check for login (if already logged in the action will simply resolve)
    E2ELogin(email, password).then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name !== CONST.TIMING.SEARCH_RENDER) {
                return;
            }

            E2EClient.submitTestResults({
                name: CONST.TIMING.SEARCH_RENDER,
                duration: entry.duration,
            }).then(E2EClient.submitTestDone);
        });

        Navigation.navigate(ROUTES.SEARCH);
    });
};

export default test;
