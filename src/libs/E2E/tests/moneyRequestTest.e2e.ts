import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import {tap, waitForElement, waitForEvent, waitForTextInputValue} from '@libs/E2E/interactions';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import CONST from '@src/CONST';
import * as NativeCommands from '../../../../tests/e2e/nativeCommands/NativeCommandsAction';

const test = (config: NativeConfig) => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for money request');

    const name = getConfigValueOrThrow('name', config);

    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            return waitForAppLoaded().then(() =>
                // we don't want to submit the first login to the results
                E2EClient.submitTestDone(),
            );
        }

        console.debug('[E2E] Logged in, getting money request metrics and submitting them…');

        waitForEvent(CONST.TIMING.SIDEBAR_LOADED)
            .then(() => tap('floating-action-button'))
            .then(() => waitForElement('create-expense'))
            .then(() => tap('create-expense'))
            .then(() => waitForEvent(CONST.TIMING.OPEN_SUBMIT_EXPENSE))
            .then((entry) => {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Manual Tracking`,
                    metric: entry.duration,
                    unit: 'ms',
                });
            })
            .then(() => waitForElement('manual'))
            .then(() => tap('manual'))
            .then(() => E2EClient.sendNativeCommand(NativeCommands.makeClearCommand()))
            .then(() => tap('button_2'))
            .then(() => waitForTextInputValue('2', 'moneyRequestAmountInput'))
            .then(() => tap('next-button'))
            .then(() => waitForEvent(CONST.TIMING.OPEN_SUBMIT_EXPENSE_CONTACT))
            .then((entry) => {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Contacts`,
                    metric: entry.duration,
                    unit: 'ms',
                });
            })
            .then(() => waitForElement('+66 65 490 0617'))
            .then(() => tap('+66 65 490 0617'))
            .then(() => waitForEvent(CONST.TIMING.OPEN_SUBMIT_EXPENSE_APPROVE))
            .then((entry) => {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Submit`,
                    metric: entry.duration,
                    unit: 'ms',
                });
            })
            .then(() => {
                console.debug('[E2E] Test completed successfully, exiting…');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error while submitting test results:', err);
            });
    });
};

export default test;
