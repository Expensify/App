import EndPoints from '../../../e2e/server/endpoints';

const SERVER_ADDRESS = 'http://localhost:3000';

/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 *
 * @param {TestResult} testResult
 * @returns {Promise<void>}
 */
const submitTestResults = testResult => fetch(`${SERVER_ADDRESS}${EndPoints.testResults}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testResult),
}).then((res) => {
    if (res.statusCode === 200) {
        return;
    }
    throw new Error(`Test result submission failed with status code ${res.statusCode}`);
});

const submitTestDone = () => fetch(`${SERVER_ADDRESS}${EndPoints.testDone}`);

export default {
    submitTestResults,
    submitTestDone,
};
