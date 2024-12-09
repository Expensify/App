import Config from '../../../tests/e2e/config';
import Routes from '../../../tests/e2e/server/routes';
import type {NetworkCacheMap, TestConfig, TestResult} from './types';
import {waitForActiveRequestsToBeEmpty} from './utils/NetworkInterceptor';

type NativeCommandPayload = {
    text: string;
};

type NativeCommand = {
    actionName: string;
    payload?: NativeCommandPayload;
};

const SERVER_ADDRESS = `http://localhost:${Config.SERVER_PORT}`;

const defaultHeaders = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'X-E2E-Server-Request': 'true',
};

const defaultRequestInit: RequestInit = {
    headers: defaultHeaders,
};

const sendRequest = (url: string, data: Record<string, unknown>): Promise<Response> => {
    return fetch(url, {
        method: 'POST',
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json',
            ...defaultHeaders,
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (res.status === 200) {
            return res;
        }
        const errorMsg = `[E2E] Client failed to send request to "${url}". Returned status: ${res.status}`;
        return res
            .json()
            .then((responseText) => {
                throw new Error(`${errorMsg}: ${responseText}`);
            })
            .catch(() => {
                throw new Error(errorMsg);
            });
    });
};

/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 */
const submitTestResults = (testResult: TestResult): Promise<void> => {
    console.debug(`[E2E] Submitting test result '${testResult.name}'…`);
    return sendRequest(`${SERVER_ADDRESS}${Routes.testResults}`, testResult).then(() => {
        console.debug(`[E2E] Test result '${testResult.name}' submitted successfully`);
    });
};

const submitTestDone = () => waitForActiveRequestsToBeEmpty().then(() => fetch(`${SERVER_ADDRESS}${Routes.testDone}`, defaultRequestInit));

let currentActiveTestConfig: TestConfig | null = null;

const getTestConfig = (): Promise<TestConfig> =>
    fetch(`${SERVER_ADDRESS}${Routes.testConfig}`, defaultRequestInit)
        .then((res: Response): Promise<TestConfig> => res.json())
        .then((config: TestConfig) => {
            currentActiveTestConfig = config;
            return config;
        });

const getCurrentActiveTestConfig = () => currentActiveTestConfig;

const sendNativeCommand = (payload: NativeCommand) => {
    console.debug(`[E2E] Sending native command '${payload.actionName}'…`);
    return sendRequest(`${SERVER_ADDRESS}${Routes.testNativeCommand}`, payload).then(() => {
        console.debug(`[E2E] Native command '${payload.actionName}' sent successfully`);
    });
};

const updateNetworkCache = (appInstanceId: string, networkCache: NetworkCacheMap) => {
    console.debug('[E2E] Updating network cache…');
    return sendRequest(`${SERVER_ADDRESS}${Routes.testUpdateNetworkCache}`, {
        appInstanceId,
        cache: networkCache,
    }).then(() => {
        console.debug('[E2E] Network cache updated successfully');
    });
};

const getNetworkCache = (appInstanceId: string): Promise<NetworkCacheMap> =>
    sendRequest(`${SERVER_ADDRESS}${Routes.testGetNetworkCache}`, {appInstanceId})
        .then((res): Promise<NetworkCacheMap> => res.json())
        .then((networkCache: NetworkCacheMap) => {
            console.debug('[E2E] Network cache fetched successfully');
            return networkCache;
        });

export default {
    submitTestResults,
    submitTestDone,
    getTestConfig,
    getCurrentActiveTestConfig,
    sendNativeCommand,
    updateNetworkCache,
    getNetworkCache,
};
export type {TestResult, NativeCommand, NativeCommandPayload};
