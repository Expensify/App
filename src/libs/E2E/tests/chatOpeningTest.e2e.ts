import E2ELogin from '@libs/E2E/actions/e2eLogin';
import mockReport from '@libs/E2E/apiMocks/openReport';
import E2EClient from '@libs/E2E/client';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ReportValue = {
    reportID: string;
};

type OnyxData = {
    value: ReportValue;
};

type MockReportResponse = {
    onyxData: OnyxData[];
};

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for chat opening');
    const report = mockReport() as MockReportResponse;

    const {reportID} = report.onyxData[0].value;

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting chat opening metrics and submitting them…');
        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating report…`);
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
                    console.debug('[E2E] Done with chat opening, exiting…');
                    E2EClient.submitTestDone();
                })
                .catch((err) => {
                    console.debug('[E2E] Error while submitting test results:', err);
                });
        });
    });
};

export default test;
