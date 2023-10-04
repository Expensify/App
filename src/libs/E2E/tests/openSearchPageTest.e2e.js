import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name !== CONST.TIMING.SEARCH_RENDER) {
                return;
            }

            E2EClient.submitTestResults({
                name: 'Open Search Page TTI',
                duration: entry.duration,
            }).then(E2EClient.submitTestDone);
        });

        Navigation.navigate(ROUTES.SEARCH);
    });
};

export default test;
