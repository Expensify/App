/* eslint-disable @lwc/lwc/no-async-await */
const {createServer} = require('http');
const EndPoints = require('./endpoints');
const Logger = require('../utils/logger');

const PORT = process.env.PORT || 3000;

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

const getPostRequestData = async (req, res) => {
    if (req.method !== 'POST') {
        res.statusCode = 400;
        res.end('Unsupported method');
        return;
    }

    const data = await getReqData(req);
    try {
        return JSON.parse(data);
    } catch (e) {
        Logger.info('❌ Failed to parse request data', data);
        res.statusCode = 400;
        res.end('Invalid JSON');
    }
};

/**
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
 */
const createServerInstance = () => {
    const testResultListeners = [];
    const testDoneListeners = [];

    /**
     * Add a callback that will be called when receiving test results.
     * @param {listener} listener
     */
    const addTestResultListener = (listener) => {
        testResultListeners.push(listener);
    };

    /**
     * Will be called when a test signals that it's done.
     * @param {Function} listener
     * @returns {Function} A function to remove the listener.
     */
    const addTestDoneListener = (listener) => {
        testDoneListeners.push(listener);
        return () => {
            const index = testDoneListeners.indexOf(listener);
            if (index !== -1) {
                testDoneListeners.splice(index, 1);
            }
        };
    };

    const server = createServer(async (req, res) => {
        res.statusCode = 200;
        switch (req.url) {
            case EndPoints.testResults: {
                const data = await getPostRequestData(req, res);
                if (data == null) {
                    return;
                }

                testResultListeners.forEach((listener) => {
                    listener(data);
                });

                return res.end('ok');
            }
            case EndPoints.testDone: {
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
        addTestResultListener,
        addTestDoneListener,
        start: () => new Promise(resolve => server.listen(PORT, resolve)),
        stop: () => new Promise(resolve => server.close(resolve)),
    };
};

module.exports = createServerInstance;
