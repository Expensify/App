import E2ECleanReportActions from '@libs/E2E/actions/cleanReportActions';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import getReport from '@libs/E2E/apiMocks/openReport';
import E2EClient from '@libs/E2E/client';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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

        console.debug('[E2E] Logged in, cleaning report actions from onyx…');
        E2ECleanReportActions().then(() => {
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
    });
};

export default test;
