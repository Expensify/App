import getPlatform from '../getPlatform';
import * as Environment from '../Environment/Environment';
import Firebase from '../Firebase';
import * as API from '../API';

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
 * @param {String} [secondaryNameParam] - optional secondary event name, passed to grafana. Default is the environment name.
 */
function end(eventName, secondaryNameParam = 'env') {
    if (!timestampData[eventName]) {
        return;
    }

    function sendEvent(secondaryName = '') {
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

        if (Environment.isDevelopment()) {
            // Don't create traces on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }

        API.write('SendPerformanceTiming', {
            name: grafanaEventName,
            value: eventTime,
            platform: `${getPlatform()}`,
        });
    }

    if (secondaryNameParam === 'env') {
        Environment.getEnvironment().then(sendEvent);
    } else {
        sendEvent(secondaryNameParam);
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
