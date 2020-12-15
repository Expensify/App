import {Graphite_Timer} from './API';

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
 * End a performance timing measurment, push to Grafana
 *
 * @param {String} eventName
 */
function end(eventName) {
    if (eventName in timestampData) {
        const eventTime = Date.now() - timestampData[eventName];

        Graphite_Timer({
            name: eventName,
            value: eventTime,
            referer: 'chat'
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
