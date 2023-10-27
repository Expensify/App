import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';
import Navigation from '../../Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import * as NativeCommands from '../../../../tests/e2e/nativeCommands/NativeCommandsAction';
import waitForKeyboard from '../actions/waitForKeyboard';
import {resetRerenderCount, getRerenderCount} from '../../../pages/home/report/ReportActionCompose/ComposerWithSuggestions/index.e2e';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for typing');

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting typing metrics and submitting them…');

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name !== CONST.TIMING.SIDEBAR_LOADED) {
                return;
            }

            console.debug(`[E2E] Sidebar loaded, navigating to a report…`);
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute('98345625'));

            // Wait until keyboard is visible (so we are focused on the input):
            waitForKeyboard().then(() => {
                resetRerenderCount();
                console.debug(`[E2E] Keyboard visible, typing…`);
                E2EClient.sendNativeCommand(NativeCommands.makeTypeTextCommand('A'))
                    .then(() => {
                        setTimeout(() => {
                            const rerenderCount = getRerenderCount();

                            E2EClient.submitTestResults({
                                name: 'Composer typing rerender count',
                                renderCount: rerenderCount,
                            }).then(E2EClient.submitTestDone);
                        }, 3000);
                    })
                    .catch(() => {
                        // TODO: error handling
                    });
            });
        });
    });
};

export default test;
