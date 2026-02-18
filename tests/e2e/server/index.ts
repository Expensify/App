import type {IncomingMessage, ServerResponse} from 'http';
import {createServer} from 'http';
import type {NativeCommand, TestResult} from '@libs/E2E/client';
import type {NetworkCacheMap, TestConfig} from '@libs/E2E/types';
import config from '../config';
import * as nativeCommands from '../nativeCommands';
import * as Logger from '../utils/logger';
import Routes from './routes';

type NetworkCache = {
    appInstanceId: string;
    cache: NetworkCacheMap;
};

type RequestData = TestResult | NativeCommand | NetworkCache;

type TestStartedListener = (testConfig?: TestConfig) => void;

type TestDoneListener = () => void;

type TestResultListener = (testResult: TestResult) => void;

type AddListener<TListener> = (listener: TListener) => () => void;

type ClearAllListeners = () => void;

type ServerInstance = {
    setTestConfig: (testConfig: TestConfig) => void;
    getTestConfig: () => TestConfig;
    addTestStartedListener: AddListener<TestStartedListener>;
    addTestResultListener: AddListener<TestResultListener>;
    addTestDoneListener: AddListener<TestDoneListener>;
    clearAllTestDoneListeners: ClearAllListeners;
    forceTestCompletion: () => void;
    setReadyToAcceptTestResults: (isReady: boolean) => void;
    isReadyToAcceptTestResults: boolean;
    start: () => Promise<void>;
    stop: () => Promise<Error | undefined>;
};

const PORT = process.env.PORT ?? config.SERVER_PORT;

// Gets the request data as a string
const getReqData = (req: IncomingMessage): Promise<string> => {
    let data = '';
    req.on('data', (chunk: string) => {
        data += chunk;
    });

    return new Promise((resolve) => {
        req.on('end', () => {
            resolve(data);
        });
    });
};

// Expects a POST request with JSON data. Returns parsed JSON data.
const getPostJSONRequestData = <TRequestData extends RequestData>(req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<TRequestData | undefined> | undefined => {
    if (req.method !== 'POST') {
        res.statusCode = 400;
        res.end('Unsupported method');
        return;
    }

    return getReqData(req).then((data): TRequestData | undefined => {
        try {
            return JSON.parse(data) as TRequestData;
        } catch (e) {
            Logger.info('❌ Failed to parse request data', data);
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
};

const createListenerState = <TListener>(): [TListener[], AddListener<TListener>, ClearAllListeners] => {
    const listeners: TListener[] = [];
    const addListener = (listener: TListener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    };
    const clearAllListeners = () => {
        listeners.splice(0, listeners.length);
    };

    return [listeners, addListener, clearAllListeners];
};

/**
 * Creates a new http server.
 * The server just has two endpoints:
 *
 *  - POST: /test_results, expects a {@link TestResult} as JSON body.
 *          Send test results while a test runs.
 *  - GET: /test_done, expected to be called when test run signals it's done
 *
 *  It returns an instance to which you can add listeners for the test results, and test done events.
 */
const createServerInstance = (): ServerInstance => {
    const [testStartedListeners, addTestStartedListener] = createListenerState<TestStartedListener>();
    const [testResultListeners, addTestResultListener] = createListenerState<TestResultListener>();
    const [testDoneListeners, addTestDoneListener, clearAllTestDoneListeners] = createListenerState<TestDoneListener>();
    let isReadyToAcceptTestResults = true;

    const setReadyToAcceptTestResults = (isReady: boolean) => {
        isReadyToAcceptTestResults = isReady;
    };

    const forceTestCompletion = () => {
        for (const listener of testDoneListeners) {
            listener();
        }
    };

    let activeTestConfig: TestConfig | undefined;
    const networkCache: Record<string, NetworkCacheMap> = {};

    const setTestConfig = (testConfig: TestConfig) => {
        activeTestConfig = testConfig;
    };
    const getTestConfig = (): TestConfig => {
        if (!activeTestConfig) {
            throw new Error('No test config set');
        }

        return activeTestConfig;
    };

    const server = createServer((req, res): ServerResponse<IncomingMessage> | void => {
        res.statusCode = 200;
        switch (req.url) {
            case Routes.testConfig: {
                for (const listener of testStartedListeners) {
                    listener(activeTestConfig);
                }
                if (!activeTestConfig) {
                    throw new Error('No test config set');
                }
                return res.end(JSON.stringify(activeTestConfig));
            }

            case Routes.testResults: {
                if (!isReadyToAcceptTestResults) {
                    return res.end('ok');
                }

                getPostJSONRequestData<TestResult>(req, res)?.then((data) => {
                    if (!data) {
                        // The getPostJSONRequestData function already handled the response
                        return;
                    }

                    for (const listener of testResultListeners) {
                        listener(data);
                    }

                    res.end('ok');
                });
                break;
            }

            case Routes.testDone: {
                forceTestCompletion();
                return res.end('ok');
            }

            case Routes.testNativeCommand: {
                getPostJSONRequestData<NativeCommand>(req, res)
                    ?.then((data) => nativeCommands.executeFromPayload(data?.actionName, data?.payload))
                    .then((status) => {
                        if (status) {
                            res.end('ok');
                            return;
                        }
                        res.statusCode = 500;
                        res.end('Error executing command');
                    })
                    .catch((error: string) => {
                        Logger.error('Error executing command', error);
                        res.statusCode = 500;
                        res.end('Error executing command');
                    });
                break;
            }

            case Routes.testGetNetworkCache: {
                getPostJSONRequestData<NetworkCache>(req, res)?.then((data) => {
                    const appInstanceId = data?.appInstanceId;
                    if (!appInstanceId) {
                        res.statusCode = 400;
                        res.end('Invalid request missing appInstanceId');
                        return;
                    }

                    const cachedData = networkCache[appInstanceId] ?? {};
                    res.end(JSON.stringify(cachedData));
                });

                break;
            }

            case Routes.testUpdateNetworkCache: {
                getPostJSONRequestData<NetworkCache>(req, res)?.then((data) => {
                    const appInstanceId = data?.appInstanceId;
                    const cache = data?.cache;
                    if (!appInstanceId || !cache) {
                        res.statusCode = 400;
                        res.end('Invalid request missing appInstanceId or cache');
                        return;
                    }

                    networkCache[appInstanceId] = cache;
                    res.end('ok');
                });

                break;
            }

            default:
                res.statusCode = 404;
                res.end('Page not found!');
        }
    });

    return {
        setReadyToAcceptTestResults,
        get isReadyToAcceptTestResults() {
            return isReadyToAcceptTestResults;
        },
        setTestConfig,
        getTestConfig,
        addTestStartedListener,
        addTestResultListener,
        addTestDoneListener,
        clearAllTestDoneListeners,
        forceTestCompletion,
        start: () =>
            new Promise<void>((resolve) => {
                server.listen(PORT, resolve);
            }),
        stop: () =>
            new Promise<Error | undefined>((resolve) => {
                server.close(resolve);
            }),
    };
};

export default createServerInstance;
