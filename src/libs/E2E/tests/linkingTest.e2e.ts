import {DeviceEventEmitter} from 'react-native';
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

type ViewableItem = {
    reportActionID?: string;
};

type ViewableItemResponse = Array<{item?: ViewableItem}>;

const test = (config: NativeConfig) => {
    console.debug('[E2E] Logging in for comment linking');

    const reportID = getConfigValueOrThrow('reportID', config);
    const linkedReportID = getConfigValueOrThrow('linkedReportID', config);
    const linkedReportActionID = getConfigValueOrThrow('linkedReportActionID', config);
    const name = getConfigValueOrThrow('name', config);

    const startTestTime = Date.now();
    console.debug('[E2E] Test started at:', startTestTime);

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            return waitForAppLoaded().then(() => E2EClient.submitTestDone());
        }

        const [appearMessagePromise, appearMessageResolve] = getPromiseWithResolve();
        const [openReportPromise, openReportResolve] = getPromiseWithResolve();

        Promise.all([appearMessagePromise, openReportPromise])
            .then(() => {
                console.debug('[E2E] Test completed successfully at:', Date.now());
                console.debug('[E2E] Total test duration:', Date.now() - startTestTime, 'ms');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error while submitting test results:', err);
            });

        const subscription = DeviceEventEmitter.addListener('onViewableItemsChanged', (res: ViewableItemResponse) => {
            console.debug('[E2E] Viewable items event triggered at:', Date.now());
            console.debug('[E2E] Event details:', res);

            if (!!res && res?.at(0)?.item?.reportActionID === linkedReportActionID) {
                console.debug('[E2E] Viewable item matched at:', Date.now());
                appearMessageResolve();
                subscription.remove();
            } else {
                console.debug(`[E2E] Provided message id '${res?.at(0)?.item?.reportActionID}' doesn't match to an expected '${linkedReportActionID}'. Waiting for a next one…`);
            }
        });

        Performance.subscribeToMeasurements((entry) => {
            console.debug(`[E2E] Performance entry captured: ${entry.name} at ${entry.startTime}, duration: ${entry.duration} ms`);

            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug('[E2E] Sidebar loaded, navigating to a report at:', Date.now());
                const startNavigateTime = Date.now();
                Performance.markStart(CONST.TIMING.OPEN_REPORT);
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                console.debug('[E2E] Navigation to report took:', Date.now() - startNavigateTime, 'ms');
                return;
            }

            if (entry.name === CONST.TIMING.OPEN_REPORT) {
                console.debug('[E2E] Navigating to the linked report action at:', Date.now());
                const startLinkedNavigateTime = Date.now();
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(linkedReportID, linkedReportActionID));
                console.debug('[E2E] Navigation to linked report took:', Date.now() - startLinkedNavigateTime, 'ms');

                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name,
                    metric: entry.duration,
                    unit: 'ms',
                });

                openReportResolve();
            }
        });
    });
};

export default test;
