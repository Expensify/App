import Config from 'react-native-config';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import getPromiseWithResolve from '@libs/E2E/utils/getPromiseWithResolve';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for chat finder');

    E2ELogin().then((neededLogin: boolean): Promise<Response> | undefined => {
        if (neededLogin) {
            return waitForAppLoaded().then(() =>
                // we don't want to submit the first login to the results
                E2EClient.submitTestDone(),
            );
        }

        console.debug('[E2E] Logged in, getting chat finder metrics and submitting them…');

        const [openSearchPagePromise, openSearchPageResolve] = getPromiseWithResolve();
        const [loadSearchOptionsPromise, loadSearchOptionsResolve] = getPromiseWithResolve();

        Promise.all([openSearchPagePromise, loadSearchOptionsPromise]).then(() => {
            console.debug(`[E2E] Submitting!`);

            E2EClient.submitTestDone();
        });

        Performance.subscribeToMeasurements((entry) => {
            if (entry.name === CONST.TIMING.SIDEBAR_LOADED) {
                console.debug(`[E2E] Sidebar loaded, navigating to chat finder route…`);
                Performance.markStart(CONST.TIMING.CHAT_FINDER_RENDER);
                Navigation.navigate(ROUTES.CHAT_FINDER);
                return;
            }

            console.debug(`[E2E] Entry: ${JSON.stringify(entry)}`);

            if (entry.name === CONST.TIMING.CHAT_FINDER_RENDER) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: 'Open Chat Finder Page TTI',
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(() => {
                        openSearchPageResolve();
                        console.debug('[E2E] Done with search, exiting…');
                    })
                    .catch((err) => {
                        console.debug('[E2E] Error while submitting test results:', err);
                    });
            }

            if (entry.name === CONST.TIMING.LOAD_SEARCH_OPTIONS) {
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: 'Load Search Options',
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
