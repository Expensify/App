import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';
import * as E2EGenericPressableWrapper from '@components/Pressable/GenericPressable/index.e2e';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import getConfigValueOrThrow from '@libs/E2E/utils/getConfigValueOrThrow';
import getPromiseWithResolve from '@libs/E2E/utils/getPromiseWithResolve';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';

const test = (config: NativeConfig) => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for new search router');

    const name = getConfigValueOrThrow('name', config);

    E2ELogin().then((neededLogin: boolean): Promise<Response> | undefined => {
        if (neededLogin) {
            return waitForAppLoaded().then(() =>
                // we don't want to submit the first login to the results
                E2EClient.submitTestDone(),
            );
        }

        console.debug('[E2E] Logged in, getting search router metrics and submitting them…');

        const [openSearchRouterPromise, openSearchRouterResolve] = getPromiseWithResolve();
        const [loadSearchOptionsPromise, loadSearchOptionsResolve] = getPromiseWithResolve();

        Promise.all([openSearchRouterPromise, loadSearchOptionsPromise]).then(() => {
            console.debug(`[E2E] Submitting!`);

            E2EClient.submitTestDone();
        });

        Performance.subscribeToMeasurements((entry) => {
            console.debug(`[E2E] Entry: ${JSON.stringify(entry)}`);
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                const props = E2EGenericPressableWrapper.getPressableProps('searchButton');
                if (!props) {
                    console.debug('[E2E] Search button not found, failing test!');
                    E2EClient.submitTestResults({
                        branch: Config.E2E_BRANCH,
                        error: 'Search button not found',
                        name: `${name} Open Search Router TTI`,
                    }).then(() => E2EClient.submitTestDone());
                    return;
                }
                if (!props.onPress) {
                    console.debug('[E2E] Search button found but onPress prop was not present, failing test!');
                    E2EClient.submitTestResults({
                        branch: Config.E2E_BRANCH,
                        error: 'Search button found but onPress prop was not present',
                        name: `${name} Open Search Router TTI`,
                    }).then(() => E2EClient.submitTestDone());
                    return;
                }
                // Open the search router
                props.onPress();
            }

            if (entry.name === CONST.TIMING.OPEN_SEARCH) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} Open Search Router TTI`,
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(() => {
                        openSearchRouterResolve();
                        console.debug('[E2E] Done with search, exiting…');
                    })
                    .catch((err) => {
                        console.debug('[E2E] Error while submitting test results:', err);
                    });
            }

            if (entry.name === CONST.TIMING.LOAD_SEARCH_OPTIONS) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `${name} Load Search Options`,
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(() => {
                        loadSearchOptionsResolve();
                        console.debug('[E2E] Done with loading search options, exiting…');
                    })
                    .catch((err) => {
                        console.debug('[E2E] Error while submitting test results:', err);
                    });
            }

            console.debug(`[E2E] Submitting!`);
        });
    });
};

export default test;
