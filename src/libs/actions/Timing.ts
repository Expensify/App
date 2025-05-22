import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {SendPerformanceTimingParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import * as Environment from '@libs/Environment/Environment';
import Firebase from '@libs/Firebase';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import pkg from '../../../package.json';
import TimingMonitor from './Metrics/TimingMonitor';

type TimestampData = {
    startTime: number;
    shouldUseFirebase: boolean;
};

let timesMonitor: Record<string, TimingMonitor> = {};
let timestampData: Record<string, TimestampData> = {};
let sidebarInitialized = false;

Onyx.connect({
    key: ONYXKEYS.SIDEBAR_MEASUREMENTS,
    callback: (value) => {
        if (sidebarInitialized) {
            return;
        }
        sidebarInitialized = true;

        // todo create a new timing monitor
        createTimingMonitor(CONST.TIMING.SIDEBAR_LOADED.BASE, CONST.TIMING.SIDEBAR_LOADED.EFFECT, CONST.TIMING.SIDEBAR_LOADED.LAYOUT, ONYXKEYS.SIDEBAR_MEASUREMENTS, value);
    },
});

function createTimingMonitor(eventName: string, effectName: string, layoutName: string, onyxKey: OnyxKey, measurements: number[] | undefined) {
    if (timesMonitor[eventName]) {
        return;
    }
    timesMonitor[eventName] = new TimingMonitor(effectName, layoutName, onyxKey, measurements);
}

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
    if (!timestampData[eventName] && !timesMonitor[eventName]) {
        return;
    }

    let shouldUseFirebase = false;
    let eventTime = 0;
    if (timestampData[eventName]) {
        const data = timestampData[eventName];
        shouldUseFirebase = data.shouldUseFirebase;
        eventTime = performance.now() - data.startTime;
    } else {
        const monitor = timesMonitor[eventName];
        const layoutData = timestampData[monitor.getLayoutKey()];
        const effectData = timestampData[monitor.getEffectKey()];
        const measureType = monitor.getValidMeasurement(performance.now() - effectData.startTime);
        shouldUseFirebase = effectData.shouldUseFirebase;
        eventTime = performance.now() - (measureType === 'layout' ? layoutData.startTime : effectData.startTime);
        monitor.addMeasurement(eventTime);
    }

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
            platform: `${getPlatform()}`,
            version: `${pkg.version}`,
        };

        API.read(READ_COMMANDS.SEND_PERFORMANCE_TIMING, parameters, {});
    });
}

/**
 * Clears all timing data
 */
function clearData() {
    timestampData = {};
    timesMonitor = {};
}

export default {
    createTimingMonitor,
    start,
    end,
    clearData,
};
