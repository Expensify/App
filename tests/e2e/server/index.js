const {createServer} = require('http');
const Routes = require('./routes');
const Logger = require('../utils/logger');
const {SERVER_PORT} = require('../config');

const PORT = process.env.PORT || SERVER_PORT;

// Gets the request data as a string
const getReqData = (req) => {
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
const getPostJSONRequestData = (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 400;
        res.end('Unsupported method');
        return;
    }

    return getReqData(req).then((data) => {
        try {
            return JSON.parse(data);
        } catch (e) {
            Logger.info('❌ Failed to parse request data', data);
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
};

const createListenerState = () => {
    const listeners = [];
    const addListener = (listener) => {
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

    let activeTestConfig;

    /**
     * @param {TestConfig} testConfig
     */
    const setTestConfig = (testConfig) => {
        activeTestConfig = testConfig;
    };

    const server = createServer((req, res) => {
        res.statusCode = 200;
        switch (req.url) {
            case Routes.testConfig: {
                testStartedListeners.forEach(listener => listener(activeTestConfig));
                if (activeTestConfig == null) {
                    throw new Error('No test config set');
                }
                return res.end(JSON.stringify(activeTestConfig));
            }

            case Routes.testResults: {
                getPostJSONRequestData(req, res).then((data) => {
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
        start: () => new Promise(resolve => server.listen(PORT, resolve)),
        stop: () => new Promise(resolve => server.close(resolve)),
    };
};

module.exports = createServerInstance;
