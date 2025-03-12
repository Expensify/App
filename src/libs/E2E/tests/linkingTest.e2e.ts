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
        let lastVisibleMessageId: string | undefined;
        let verificationStarted = false;
        let hasNavigatedToLinkedMessage = false;

        const subscription = DeviceEventEmitter.addListener('onViewableItemsChanged', (res: ViewableItemResponse) => {
            console.debug('[E2E] Viewable items event triggered at:', Date.now());

            // update the last visible message
            lastVisibleMessageId = res?.at(0)?.item?.reportActionID;
            console.debug('[E2E] Current visible message:', lastVisibleMessageId);

            if (!verificationStarted && lastVisibleMessageId === linkedReportActionID) {
                console.debug('[E2E] Target message found, starting verification');
                verificationStarted = true;

                setTimeout(() => {
                    console.debug('[E2E] Verification timeout completed');
                    console.debug('[E2E] Last visible message ID:', lastVisibleMessageId);
                    console.debug('[E2E] Expected message ID:', linkedReportActionID);

                    subscription.remove();
                    if (lastVisibleMessageId === linkedReportActionID) {
                        console.debug('[E2E] Message position verified successfully');
                        appearMessageResolve();
                    } else {
                        console.debug('[E2E] Linked message not found, failing test!');
                        E2EClient.submitTestResults({
                            branch: Config.E2E_BRANCH,
                            error: 'Linked message not found',
                            name: `${name} test can't find linked message`,
                        }).then(() => E2EClient.submitTestDone());
                    }
                }, 3000);
            }
        });

        Promise.all([appearMessagePromise, openReportPromise])
            .then(() => {
                console.debug('[E2E] Test completed successfully at:', Date.now());
                console.debug('[E2E] Total test duration:', Date.now() - startTestTime, 'ms');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error while submitting test results:', err);
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

            if (entry.name === CONST.TIMING.OPEN_REPORT && !hasNavigatedToLinkedMessage) {
                console.debug('[E2E] Navigating to the linked report action at:', Date.now());
                const startLinkedNavigateTime = Date.now();
                hasNavigatedToLinkedMessage = true; // Set flag to prevent duplicate navigation
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
