import * as API from '@libs/API';
import type {SendPerformanceTimingParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import * as Environment from '@libs/Environment/Environment';
import Firebase from '@libs/Firebase';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';

type TimestampData = {
    startTime: number;
    shouldUseFirebase: boolean;
};

let timestampData: Record<string, TimestampData> = {};

/**
 * Start a performance timing measurement
 *
 * @param eventName
 * @param shouldUseFirebase - adds an additional trace in Firebase
 */
function start(eventName: string, shouldUseFirebase = true) {
    if (shouldUseFirebase) {
        Firebase.startTrace(eventName);
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
function end(eventName: string, secondaryName = '', maxExecutionTime = 0) {
    if (!timestampData[eventName]) {
        return;
    }

    const {startTime, shouldUseFirebase} = timestampData[eventName];

    const eventTime = performance.now() - startTime;

    if (shouldUseFirebase) {
        Firebase.stopTrace(eventName);
    }

    Environment.getEnvironment().then((envName) => {
        const baseEventName = `${envName}.new.expensify.${eventName}`;
        const grafanaEventName = secondaryName ? `${baseEventName}.${secondaryName}` : baseEventName;

        console.debug(`Timing:${grafanaEventName}`, eventTime);
        delete timestampData[eventName];

        if (Environment.isDevelopment()) {
            // Don't create traces on dev as this will mess up the accuracy of data in release builds of the app
            return;
        }

        if (maxExecutionTime && eventTime > maxExecutionTime) {
            Log.warn(`${eventName} exceeded max execution time of ${maxExecutionTime}.`, {eventTime, eventName});
        }

        const parameters: SendPerformanceTimingParams = {
            name: grafanaEventName,
            value: eventTime,
            platform: getPlatform(),
        };

        API.read(READ_COMMANDS.SEND_PERFORMANCE_TIMING, parameters, {});
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
