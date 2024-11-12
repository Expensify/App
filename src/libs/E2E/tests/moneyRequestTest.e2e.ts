import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';
import * as E2EGenericPressableWrapper from '@components/Pressable/GenericPressable/index.e2e';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import getPromiseWithResolve from '@libs/E2E/utils/getPromiseWithResolve';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import * as NativeCommands from '../../../../tests/e2e/nativeCommands/NativeCommandsAction';
import {tap, waitFor} from '../interactions';

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

        const [appearSubmitExpenseScreenPromise, appearSubmitExpenseScreenResolve] = getPromiseWithResolve();
        const [appearContactsScreenPromise, appearContactsScreenResolve] = getPromiseWithResolve();
        const [approveScreenPromise, approveScreenResolve] = getPromiseWithResolve();

        Promise.all([appearSubmitExpenseScreenPromise, appearContactsScreenPromise, approveScreenPromise])
            .then(() => {
                console.debug('[E2E] Test completed successfully, exiting…');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error while submitting test results:', err);
            });

        console.debug('[E2E] Logged in, getting money request metrics and submitting them…');

        waitFor('+66 65 490 0617').then(() => {
            Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE_APPROVE);
            tap('+66 65 490 0617');
        });

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating to submit expense…`);
                Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE);
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, ReportUtils.generateReportID()),
                );
            }

            if (entry.name === CONST.TIMING.OPEN_SUBMIT_EXPENSE) {
                appearSubmitExpenseScreenResolve();
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Manual Tracking`,
                    metric: entry.duration,
                    unit: 'ms',
                });
                setTimeout(() => {
                    tap('button_2');
                }, 1000);
                setTimeout(() => {
                    Performance.markStart(CONST.TIMING.OPEN_SUBMIT_EXPENSE_CONTACT);
                    tap('next-button');
                }, 4000);
                /* E2EClient.sendNativeCommand(NativeCommands.makeTypeTextCommand('3'))
                    .then(() => E2EClient.sendNativeCommand(NativeCommands.makeEnterCommand()))
                    .then(() => {
                        const nextButton = E2EGenericPressableWrapper.getPressableProps('next-button');
                        nextButton?.onPress?.();
                    }); */
            }

            if (entry.name === CONST.TIMING.OPEN_SUBMIT_EXPENSE_CONTACT) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Contacts`,
                    metric: entry.duration,
                    unit: 'ms',
                });
                appearContactsScreenResolve();
                console.log(111);
            }

            if (entry.name === CONST.TIMING.OPEN_SUBMIT_EXPENSE_APPROVE) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} - Open Submit`,
                    metric: entry.duration,
                    unit: 'ms',
                });
                approveScreenResolve();
            }
        });
    });
};

export default test;
