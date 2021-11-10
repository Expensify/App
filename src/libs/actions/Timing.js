import getPlatform from '../getPlatform';
// eslint-disable-next-line import/no-cycle
import {Graphite_Timer} from '../API';
import {isDevelopment} from '../Environment/Environment';
import Firebase from '../Firebase';

let timestampData = {};

/**
 * Start a performance timing measurement
 *
 * @param {String} eventName
 * @param {Boolean} shouldUseFirebase - adds an additional trace in Firebase
 */
function start(eventName, shouldUseFirebase = false) {
    timestampData[eventName] = {startTime: Date.now(), shouldUseFirebase};

    if (!shouldUseFirebase) {
        return;
    }

    Firebase.startTrace(eventName);
}

/**
 * End performance timing. Measure the time between event start/end in milliseconds, and push to Grafana
 *
 * @param {String} eventName - event name used as timestamp key
 * @param {String} [secondaryName] - optional secondary event name, passed to grafana
 */
function end(eventName, secondaryName = '') {
    if (!timestampData[eventName]) {
        return;
    }

    const {startTime, shouldUseFirebase} = timestampData[eventName];
    const eventTime = Date.now() - startTime;

    if (shouldUseFirebase) {
        Firebase.stopTrace(eventName);
    }

    const grafanaEventName = secondaryName
        ? `expensify.cash.${eventName}.${secondaryName}`
        : `expensify.cash.${eventName}`;

    console.debug(`Timing:${grafanaEventName}`, eventTime);
    delete timestampData[eventName];

    if (isDevelopment()) {
        // Don't create traces on dev as this will mess up the accuracy of data in release builds of the app
        return;
    }

    Graphite_Timer({
        name: grafanaEventName,
        value: eventTime,
        platform: `${getPlatform()}`,
    });
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
