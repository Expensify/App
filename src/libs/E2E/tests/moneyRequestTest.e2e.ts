import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import {tap, waitForElement, waitForEvent} from '@libs/E2E/interactions';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
            .then(() => {
                console.debug(`[E2E] Sidebar loaded, navigating to submit expense…`);
                Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE);
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID()),
                );
            })
            .then(() => waitForEvent(CONST.TIMING.OPEN_SUBMIT_EXPENSE))
            .then((entry) => {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Manual Tracking`,
                    metric: entry.duration,
                    unit: 'ms',
                });
                setTimeout(() => {
                    tap('button_2');
                }, 2000);
                setTimeout(() => {
                    Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE_CONTACT);
                    tap('next-button');
                }, 4000);
            })
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
            .then(() => {
                Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE_APPROVE);
                tap('+66 65 490 0617');
            })
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
