import Config from 'react-native-config';
import type {PerformanceEntry} from 'react-native-performance';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import waitForAppLoaded from '@libs/E2E/actions/waitForAppLoaded';
import E2EClient from '@libs/E2E/client';
import Performance from '@libs/Performance';

const test = () => {
    console.log(8888, 'TEST 1');
    // check for login (if already logged in the action will simply resolve)
    E2ELogin().then(async (neededLogin) => {
        console.log(7777, {neededLogin});
        if (neededLogin) {
            return waitForAppLoaded().then(() =>
                // we don't want to submit the first login to the results
                E2EClient.submitTestDone(),
            );
        }

        console.debug('[E2E] Logged in, getting metrics and submitting them…');

        // collect performance metrics and submit
        const metrics: PerformanceEntry[] = Performance.getPerformanceMetrics();

        // when hangs it has `[]`
        console.log(98989898, {metrics});

        // alert(metrics);

        // await new Promise((resolve) => setTimeout(resolve, 20000));

        // underscore promises in sequence without for-loop
        Promise.all(
            metrics.map((metric) =>
                E2EClient.submitTestResults({
                    branch: Config.E2E_BRANCH,
                    name: `App start ${metric.name}`,
                    duration: metric.duration,
                }),
            ),
        )
            .then(() => {
                console.debug('[E2E] Done, exiting…');
                E2EClient.submitTestDone();
            })
            .catch((err) => {
                console.debug('[E2E] Error while submitting test results:', err);
            });
    });
};

export default test;
