import Config from 'react-native-config';
import {PerformanceEntry} from 'react-native-performance';
import E2ELogin from '@libs/E2E/actions/e2eLogin';
import E2EClient from '@libs/E2E/client';
import Performance from '@libs/Performance';

const test = () => {
    // check for login (if already logged in the action will simply resolve)
    E2ELogin().then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting metrics and submitting them…');

        // collect performance metrics and submit
        const metrics: PerformanceEntry[] = Performance.getPerformanceMetrics();

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
