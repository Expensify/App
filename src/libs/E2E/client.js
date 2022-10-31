import {Alert} from 'react-native';
import LaunchArguments from './launchArgs';

const launchArgs = LaunchArguments.value();
console.debug('[E2E] launchArgs', launchArgs);

/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 *
 * @param {TestResult} testResult
 */
const submitTestResults = (testResult) => {
    Alert.alert('RESULTS_ALERT', `RESULTS_STR:${JSON.stringify(testResult)}`);
};

// TODO: remove
const submitTestDone = () => {
    // throw new Error('"submitTestDone" Not implemented yet');
    console.debug('noop, not needed anymore');
    // Alert.alert('RESULTS_ALERT', 'RESULTS_STR:{}');
};

/**
 * @returns {Promise<TestConfig>}
 */
const getTestName = () => launchArgs.testName;

export default {
    submitTestResults,
    submitTestDone,
    getTestName,
};
