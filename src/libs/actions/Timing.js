import getPlatform from '../getPlatform';
import {Graphite_Timer} from '../API';

let timestampData = {};

/**
 * Start a performance timing measurement
 *
 * @param {String} eventName
 */
function start(eventName) {
    timestampData[eventName] = Date.now();
}

/**
 * End performance timing. Measure the time between event start/end in milliseconds, and push to Grafana
 *
 * @param {String} eventName - event name used as timestamp key
 * @param {String} [secondaryName] - optional secondary event name, passed to grafana
 */
function end(eventName, secondaryName = '') {
    if (eventName in timestampData) {
        const eventTime = Date.now() - timestampData[eventName];
        const grafanaEventName = secondaryName
            ? `expensify.cash.${eventName}.${secondaryName}`
            : `expensify.cash.${eventName}`;

        console.debug(`Timing:${grafanaEventName}`, eventTime);

        Graphite_Timer({
            name: grafanaEventName,
            value: eventTime,
            platform: `${getPlatform()}`,
        });

        delete timestampData[eventName];
    }
}

/**
 * Clears all timing data
 */
function clearData() {
    timestampData = {};
}

export default {
    start,
    end,
    clearData,
};
