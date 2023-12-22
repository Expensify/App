import Config from '../../../tests/e2e/config';
import Routes from '../../../tests/e2e/server/routes';

type TestResult = {
    name: string;
    branch?: string;
    duration?: number;
    error?: string;
    renderCount?: number;
};

type TestConfig = {
    name: string;
};

type NativeCommandPayload = {
    text: string;
};

type NativeCommand = {
    actionName: string;
    payload?: NativeCommandPayload;
};

const SERVER_ADDRESS = `http://localhost:${Config.SERVER_PORT}`;

/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 */
const submitTestResults = (testResult: TestResult): Promise<void> => {
    console.debug(`[E2E] Submitting test result '${testResult.name}'…`);
    return fetch(`${SERVER_ADDRESS}${Routes.testResults}`, {
        method: 'POST',
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResult),
    }).then((res) => {
        if (res.status === 200) {
            console.debug(`[E2E] Test result '${testResult.name}' submitted successfully`);
            return;
        }
        const errorMsg = `Test result submission failed with status code ${res.status}`;
        res.json()
            .then((responseText) => {
                throw new Error(`${errorMsg}: ${responseText}`);
            })
            .catch(() => {
                throw new Error(errorMsg);
            });
    });
};

const submitTestDone = () => fetch(`${SERVER_ADDRESS}${Routes.testDone}`);

let currentActiveTestConfig: TestConfig | null = null;

const getTestConfig = (): Promise<TestConfig> =>
    fetch(`${SERVER_ADDRESS}${Routes.testConfig}`)
        .then((res: Response): Promise<TestConfig> => res.json())
        .then((config: TestConfig) => {
            currentActiveTestConfig = config;
            return config;
        });

const getCurrentActiveTestConfig = () => currentActiveTestConfig;

const sendNativeCommand = (payload: NativeCommand) =>
    fetch(`${SERVER_ADDRESS}${Routes.testNativeCommand}`, {
        method: 'POST',
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then((res) => {
        if (res.status === 200) {
            return true;
        }
        const errorMsg = `Sending native command failed with status code ${res.status}`;
        res.json()
            .then((responseText) => {
                throw new Error(`${errorMsg}: ${responseText}`);
            })
            .catch(() => {
                throw new Error(errorMsg);
            });
    });

export default {
    submitTestResults,
    submitTestDone,
    getTestConfig,
    getCurrentActiveTestConfig,
    sendNativeCommand,
};
