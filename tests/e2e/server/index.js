const {createServer} = require('http');
const Routes = require('./routes');
const Logger = require('../utils/logger');
const {SERVER_PORT} = require('../config');
const {executeFromPayload} = require('../nativeCommands');

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

const https = require('https');

function simpleHttpRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {method}, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
        req.on('error', reject);
        req.end();
    });
}

const parseString = require('xml2js').parseString;

function simpleXMLToJSON(xml) {
    // using xml2js
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

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
                testStartedListeners.forEach((listener) => listener(activeTestConfig));
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

            case Routes.testNativeCommand: {
                getPostJSONRequestData(req, res)
                    .then((data) =>
                        executeFromPayload(data.actionName, data.payload).then((status) => {
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

            case Routes.getOtpCode: {
                // Wait 10 seconds for the email to arrive
                setTimeout(() => {
                    simpleHttpRequest('https://www.trashmail.de/inbox-api.php?name=expensify.testuser')
                        .then(simpleXMLToJSON)
                        .then(({feed}) => {
                            const firstEmailID = feed.entry[0].id;
                            // Get email content:
                            return simpleHttpRequest(`https://www.trashmail.de/mail-api.php?name=expensify.testuser&id=${firstEmailID}`).then(simpleXMLToJSON);
                        })
                        .then(({feed}) => {
                            const content = feed.entry[0].content[0];
                            // content is a string, find code using regex based on text "Use 259463 to sign"
                            const otpCode = content.match(/Use (\d+) to sign/)[1];
                            console.debug('otpCode', otpCode);
                            res.end(otpCode);
                        });
                }, 10000);
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
        start: () => new Promise((resolve) => server.listen(PORT, resolve)),
        stop: () => new Promise((resolve) => server.close(resolve)),
    };
};

module.exports = createServerInstance;
