import type {IncomingMessage, ServerResponse} from 'http';
import {createServer} from 'http';
import type {TestConfig, TestResult} from '@libs/E2E/types';
import config from '../config';
import * as nativeCommands from '../nativeCommands';
import * as Logger from '../utils/logger';
import Routes from './routes';

const PORT = process.env.PORT ?? config.SERVER_PORT;

type Response = ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
};

type PostJSONRequestData = {
    appInstanceId: string;
    cache: Cache;
    actionName: string;
    payload: unknown;
};

type ListenerArgs = (Partial<TestResult> & Partial<TestConfig | PostJSONRequestData>) | null;
type Listener = (args?: ListenerArgs) => void;

// Gets the request data as a string
const getReqData = (req: IncomingMessage): Promise<string> => {
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    });

    return new Promise((resolve) => {
        req.on('end', () => {
            resolve(data);
        });
    });
};

// Expects a POST request with JSON data. Returns parsed JSON data.
const getPostJSONRequestData = (req: IncomingMessage, res: Response): Promise<PostJSONRequestData | undefined> | undefined => {
    if (req.method !== 'POST') {
        res.statusCode = 400;
        res.end('Unsupported method');
        return;
    }

    return getReqData(req).then((data) => {
        try {
            return JSON.parse(data) as PostJSONRequestData;
        } catch (e) {
            Logger.info('❌ Failed to parse request data', data);
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
};

const createListenerState = (): [Listener[], (listener: Listener) => () => void] => {
    const listeners: Listener[] = [];
    const addListener = (listener: Listener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    };

    return [listeners, addListener];
};

/**
 * The test result object that a client might submit to the server.
 * @typedef TestResult
 * @property {string} name
 * @property {number} duration Milliseconds
 * @property {string} [error] Optional, if set indicates that the test run failed and has no valid results.
 */

/**
 * @callback listener
 * @param {TestResult} testResult
 */

// eslint-disable-next-line valid-jsdoc
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
const createServerInstance = () => {
    const [testStartedListeners, addTestStartedListener] = createListenerState();
    const [testResultListeners, addTestResultListener] = createListenerState();
    const [testDoneListeners, addTestDoneListener] = createListenerState();

    let activeTestConfig: TestConfig | null;
    const networkCache: Record<string, unknown> = {};

    const setTestConfig = (testConfig: TestConfig | null) => {
        activeTestConfig = testConfig;
    };

    const server = createServer((req, res) => {
        res.statusCode = 200;
        switch (req.url) {
            case Routes.testConfig: {
                testStartedListeners.forEach((listener) => listener(activeTestConfig));
                if (activeTestConfig == null) {
                    throw new Error('No test config set');
                }
                return res.end(JSON.stringify(activeTestConfig));
            }

            case Routes.testResults: {
                getPostJSONRequestData(req, res)?.then((data) => {
                    if (data == null) {
                        // The getPostJSONRequestData function already handled the response
                        return;
                    }

                    testResultListeners.forEach((listener) => {
                        listener(data);
                    });

                    res.end('ok');
                });
                break;
            }

            case Routes.testDone: {
                testDoneListeners.forEach((listener) => {
                    listener();
                });
                return res.end('ok');
            }

            case Routes.testNativeCommand: {
                getPostJSONRequestData(req, res)
                    ?.then((data) =>
                        nativeCommands.executeFromPayload(data?.actionName, data?.payload).then((status) => {
                            if (status) {
                                res.end('ok');
                                return;
                            }
                            res.statusCode = 500;
                            res.end('Error executing command');
                        }),
                    )
                    .catch((error) => {
                        Logger.error('Error executing command', error);
                        res.statusCode = 500;
                        res.end('Error executing command');
                    });
                break;
            }

            case Routes.testGetNetworkCache: {
                getPostJSONRequestData(req, res)?.then((data) => {
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
                getPostJSONRequestData(req, res)?.then((data) => {
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
        setTestConfig,
        addTestStartedListener,
        addTestResultListener,
        addTestDoneListener,
        start: () => new Promise<void>((resolve) => server.listen(PORT, resolve)),
        stop: () => new Promise((resolve) => server.close(resolve)),
    };
};

export default createServerInstance;
