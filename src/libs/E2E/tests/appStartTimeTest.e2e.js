import E2ELogin from '../actions/e2eLogin';
import Performance from '../../Performance';
import E2EClient from '../client';

const test = () => {
    const email = 'applausetester+perf2@applause.expensifail.com';
    const password = 'Password123';

    console.debug('[E2E] App is ready, logging in…');

    // check for login (if already logged in the action will simply resolve)
    E2ELogin(email, password).then((neededLogin) => {
        if (neededLogin) {
            // we don't want to submit the first login to the results
            return E2EClient.submitTestDone();
        }

        console.debug('[E2E] Logged in, getting metrics and submitting them…');

        // collect performance metrics and submit
        const metrics = Performance.getPerformanceMetrics();

        E2EClient.submitTestResults(metrics);
    });
};

export default test;
