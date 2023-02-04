import Routes from '../../../tests/e2e/server/routes';
import Config from '../../../tests/e2e/config';

const SERVER_ADDRESS = `http://localhost:${Config.SERVER_PORT}`;

/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 *
 * @param {TestResult} testResult
 * @returns {Promise<void>}
 */
const submitTestResults = testResult => fetch(`${SERVER_ADDRESS}${Routes.testResults}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testResult),
}).then((res) => {
    if (res.statusCode === 200) {
        console.debug(`[E2E] Test result '${testResult.name}' submitted successfully`);
        return;
    }
    const errorMsg = `Test result submission failed with status code ${res.statusCode}`;
    res.json().then((responseText) => {
        throw new Error(`${errorMsg}: ${responseText}`);
    }).catch(() => {
        throw new Error(errorMsg);
    });
});

const submitTestDone = () => fetch(`${SERVER_ADDRESS}${Routes.testDone}`);

/**
 * @returns {Promise<TestConfig>}
 */
const getTestConfig = () => fetch(`${SERVER_ADDRESS}${Routes.testConfig}`)
    .then(res => res.json())
    .then(config => config);

export default {
    submitTestResults,
    submitTestDone,
    getTestConfig,
};
