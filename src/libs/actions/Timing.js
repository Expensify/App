
exports.__esModule = true;
const API = require('@libs/API');
const types_1 = require('@libs/API/types');
const Environment = require('@libs/Environment/Environment');
const Firebase_1 = require('@libs/Firebase');
const getPlatform_1 = require('@libs/getPlatform');
const Log_1 = require('@libs/Log');
const package_json_1 = require('../../../package.json');

let timestampData = {};
/**
 * Start a performance timing measurement
 *
 * @param eventName
 * @param shouldUseFirebase - adds an additional trace in Firebase
 */
function start(eventName, shouldUseFirebase) {
    if (shouldUseFirebase === void 0) {
        shouldUseFirebase = true;
    }
    if (shouldUseFirebase) {
        Firebase_1['default'].startTrace(eventName);
    }
    timestampData[eventName] = {startTime: performance.now(), shouldUseFirebase};
}
/**
 * End performance timing. Measure the time between event start/end in milliseconds, and push to Grafana
 *
 * @param eventName - event name used as timestamp key
 * @param [secondaryName] - optional secondary event name, passed to grafana
 * @param [maxExecutionTime] - optional amount of time (ms) to wait before logging a warn
 */
function end(eventName, secondaryName, maxExecutionTime) {
    if (secondaryName === void 0) {
        secondaryName = '';
    }
    if (maxExecutionTime === void 0) {
        maxExecutionTime = 0;
    }
    if (!timestampData[eventName]) {
        return;
    }
    const _a = timestampData[eventName];
        const startTime = _a.startTime;
        const shouldUseFirebase = _a.shouldUseFirebase;
    const eventTime = performance.now() - startTime;
    if (shouldUseFirebase) {
        Firebase_1['default'].stopTrace(eventName);
    }
    Environment.getEnvironment().then(function (envName) {
        const baseEventName = `${envName  }.new.expensify.${  eventName}`;
        const grafanaEventName = secondaryName ? `${baseEventName  }.${  secondaryName}` : baseEventName;
        console.debug(`Timing:${  grafanaEventName}`, eventTime);
        delete timestampData[eventName];
        if (Environment.isDevelopment()) {
            // Don't create traces on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }
        if (maxExecutionTime && eventTime > maxExecutionTime) {
            Log_1['default'].warn(`${eventName  } exceeded max execution time of ${  maxExecutionTime  }.`, {eventTime, eventName});
        }
        const parameters = {
            name: grafanaEventName,
            value: eventTime,
            platform: `${  getPlatform_1['default']()}`,
            version: `${  package_json_1['default'].version}`,
        };
        API.read(types_1.READ_COMMANDS.SEND_PERFORMANCE_TIMING, parameters, {});
    });
}
/**
 * Clears all timing data
 */
function clearData() {
    timestampData = {};
}
exports['default'] = {
    start,
    end,
    clearData,
};
