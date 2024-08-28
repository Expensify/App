import type {NativeConfig} from 'react-native-config';
import Config from 'react-native-config';
import {runOnUI} from 'react-native-reanimated';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import waitForKeyboard from '@libs/E2E/actions/waitForKeyboard';
import E2EClient from '@libs/E2E/client';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import getPromiseWithResolve from '@libs/E2E/utils/getPromiseWithResolve';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {getRerenderCount, resetRerenderCount} from '@pages/home/report/ReportActionCompose/ComposerWithSuggestions/index.e2e';
import {onSubmitAction} from '@pages/home/report/ReportActionCompose/ReportActionCompose';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import * as NativeCommands from '../../../../tests/e2e/nativeCommands/NativeCommandsAction';

const test = (config: NativeConfig) => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for typing');

    const reportID = getConfigValueOrThrow('reportID', config);
    const message = getConfigValueOrThrow('message', config);

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            return waitForAppLoaded().then(() =>
                // we don't want to submit the first login to the results
                E2EClient.submitTestDone(),
            );
        }

        console.debug('[E2E] Logged in, getting typing metrics and submitting them…');

        const [renderTimesPromise, renderTimesResolve] = getPromiseWithResolve();
        const [messageSentPromise, messageSentResolve] = getPromiseWithResolve();

        Promise.all([renderTimesPromise, messageSentPromise]).then(() => {
            console.debug(`[E2E] Submitting!`);

            E2EClient.submitTestDone();
        });

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.MESSAGE_SENT) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: 'Message sent',
                    metric: entry.duration,
                    unit: 'ms',
                }).then(messageSentResolve);
                return;
            }

            if (entry.name !== CONST.TIMING.SIDEBAR_LOADED) {
                return;
            }

            console.debug(`[E2E] Sidebar loaded, navigating to a report…`);
            // Crowded Policy (Do Not Delete) Report, has a input bar available:
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));

            // Wait until keyboard is visible (so we are focused on the input):
            waitForKeyboard().then(() => {
                console.debug(`[E2E] Keyboard visible, typing…`);
                E2EClient.sendNativeCommand(NativeCommands.makeBackspaceCommand())
                    .then(() => {
                        resetRerenderCount();
                        return Promise.resolve();
                    })
                    .then(() => E2EClient.sendNativeCommand(NativeCommands.makeTypeTextCommand('A')))
                    .then(
                        () =>
                            new Promise((resolve) => {
                                setTimeout(() => {
                                    const rerenderCount = getRerenderCount();

                                    E2EClient.submitTestResults({
                                        branch: Config.E2E_BRANCH,
                                        name: 'Composer typing rerender count',
                                        metric: rerenderCount,
                                        unit: 'renders',
                                    })
                                        .then(renderTimesResolve)
                                        .then(resolve);
                                }, 3000);
                            }),
                    )
                    .then(() => E2EClient.sendNativeCommand(NativeCommands.makeBackspaceCommand()))
                    .then(() => E2EClient.sendNativeCommand(NativeCommands.makeTypeTextCommand(message)))
                    .then(() => runOnUI(onSubmitAction)())
                    .catch((error) => {
                        console.error('[E2E] Error while test', error);
                        E2EClient.submitTestDone();
                    });
            });
        });
    });
};

export default test;
