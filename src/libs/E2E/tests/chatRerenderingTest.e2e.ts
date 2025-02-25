import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import getPromiseWithResolve from '@libs/E2E/utils/getPromiseWithResolve';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const RERENDER_WAIT_TIME = 7000;

const test = (config: NativeConfig) => {
    console.debug('==========================================');
    console.debug('[E2E] Starting rerender test');
    console.debug('==========================================');

    const reportID = getConfigValueOrThrow('reportID', config);
    const name = getConfigValueOrThrow('name', config);

    let totalRenderCount = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            return waitForAppLoaded().then(() => E2EClient.submitTestDone());
        }

        const [openReportPromise, openReportResolve] = getPromiseWithResolve();

        openReportPromise
            .then(() => {
                console.debug(`Total renders: ${totalRenderCount}`);
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name,
                    metric: totalRenderCount,
                    unit: 'renders',
                });
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                console.debug('[E2E] Test completed');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                console.debug('[E2E] Error:', err);
                console.error(err);
            });

        const startTimer = () => {
            // Clear existing timeout if any
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Set new timeout
            timeoutId = setTimeout(() => {
                console.debug('[E2E] No new renders for 5 seconds, completing test');
                openReportResolve();
            }, RERENDER_WAIT_TIME);
        };

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === '<ReportScreen> rendering') {
                totalRenderCount++;
            }

            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug('[E2E] Sidebar loaded -> Navigating to report');
                Performance.markStart(CONST.TIMING.OPEN_REPORT);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            }

            if (entry.name === CONST.TIMING.OPEN_REPORT) {
                // Start initial timer
                startTimer();
            }
        });
    });
};

export default test;
