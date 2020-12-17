import getPlatform from '../getPlatform';
import {Graphite_Timer} from '../API';

let timestampData = {};

/**
 * Start a performance timing measurment
 *
 * @param {String} eventName
 */
function start(eventName) {
    timestampData[eventName] = Date.now();
}

/**
 * End performance timing. Measure the time between event start/end in milliseconds, and push to Grafana
 *
 * @param {String} eventName
 */
function end(eventName) {
    if (eventName in timestampData) {
        const eventTime = Date.now() - timestampData[eventName];

        Graphite_Timer({
            name: `expensify.cash.${eventName}`,
            value: eventTime,
            referer: `${getPlatform()}`
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
    clearData
};
