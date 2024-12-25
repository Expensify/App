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

const RERENDER_WAIT_TIME = 5000;
const RENDER_DEBOUNCE_TIME = 0; // Add debounce time to group rapid rerenders

const test = (config: NativeConfig) => {
    console.debug('==========================================');
    console.debug('[E2E] Starting rerender test');
    console.debug('==========================================');

    const reportID = getConfigValueOrThrow('reportID', config);
    const name = getConfigValueOrThrow('name', config);

    // Track both raw and unique render times
    const renderTimes = new Set<number>();
    const rawRenderTimes: number[] = [];
    const startTestTime = Date.now();
    let uniqueRenderCount = 0;
    let totalRenderCount = 0;

    // Add render phase tracking
    const renderPhases = {
        mount: 0,
        update: 0,
        'nested-update': 0,
    };

    const logStats = () => {
        console.debug('==========================================');
        console.debug('[E2E] RERENDER TEST STATS');
        console.debug(`Total renders: ${totalRenderCount}`);
        console.debug(`Unique renders (${RENDER_DEBOUNCE_TIME}ms debounce): ${uniqueRenderCount}`);
        console.debug('Render phases:', renderPhases);
        console.debug(`Total duration: ${Date.now() - startTestTime}ms`);
        console.debug('Render times (debounced):', Array.from(renderTimes));
        console.debug('Raw render times:', rawRenderTimes);
        console.debug('==========================================');
    };

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            return waitForAppLoaded().then(() => E2EClient.submitTestDone());
        }

        const [openReportPromise, openReportResolve] = getPromiseWithResolve();

        openReportPromise
            .then(() => {
                logStats();
                console.debug('[E2E] Test completed');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error:', err);
                console.error(err);
            });

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === '<ReportScreen> rendering') {
                const currentTime = Date.now();
                const phase = entry.detail?.phase;

                // Track all renders
                if (['mount', 'update', 'nested-update'].includes(phase)) {
                    totalRenderCount++;
                    rawRenderTimes.push(currentTime);

                    // Increment phase counter
                    if (phase) {
                        renderPhases[phase]++;
                    }

                    // Check if this render is unique (debounced)
                    const isUniqueRender = !Array.from(renderTimes).some((time) => Math.abs(currentTime - time) < RENDER_DEBOUNCE_TIME);

                    if (isUniqueRender) {
                        renderTimes.add(currentTime);
                        uniqueRenderCount++;
                    }
                }
            }

            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug('[E2E] Sidebar loaded -> Navigating to report');
                Performance.markStart(CONST.TIMING.OPEN_REPORT);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            }

            if (entry.name === CONST.TIMING.OPEN_REPORT) {
                setTimeout(() => {
                    logStats();
                    E2EClient.submitTestResults({
                        branch: Config.E2E_BRANCH,
                        name,
                        metric: uniqueRenderCount,
                        unit: 'renders',
                    });
                    openReportResolve();
                }, RERENDER_WAIT_TIME);
            }
        });
    });
};

export default test;
