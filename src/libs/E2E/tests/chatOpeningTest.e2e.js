import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import getReport from '../apiMocks/openReport';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for chat opening');
    const report = getReport();
    const reportID = report.onyxData[0].value.reportID;

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting chat opening metrics and submitting them…');

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating to search route…`);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                return;
            }
            console.debug(`[E2E] Entry: ${JSON.stringify(entry)}`);
            if (entry.name !== CONST.TIMING.CHAT_RENDER) {
                return;
            }

            console.debug(`[E2E] Submitting!`);
            E2EClient.submitTestResults({
                name: 'Chat opening',
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
