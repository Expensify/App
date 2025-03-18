import {profiler} from '@perf-profiler/profiler';
import {getAverageCpuUsage, getAverageCpuUsagePerProcess, getAverageFPSUsage, getAverageRAMUsage} from '@perf-profiler/reporter';
import {ThreadNames} from '@perf-profiler/types';
import type {Measure} from '@perf-profiler/types';
import * as Logger from './logger';

let measures: Measure[] = [];
const POLLING_STOPPED = {
    stop: (): void => {
        throw new Error('Cannot stop polling on a stopped profiler');
    },
};
let polling = POLLING_STOPPED;

type StartOptions = {
    onAttachFailed: () => Promise<void>;
};

const start = (bundleId: string, {onAttachFailed}: StartOptions) => {
    // clear our measurements results
    measures = [];

    polling = profiler.pollPerformanceMeasures(bundleId, {
        onMeasure: (measure: Measure) => {
            measures.push(measure);
        },
        onPidChanged: () => {
            onAttachFailed();
        },
    });

    Logger.info(`Starting performance measurements for ${bundleId}`);
};

const stop = (whoTriggered: string) => {
    Logger.info(`Stop performance measurements... Was triggered by ${whoTriggered}`);
    polling.stop();
    polling = POLLING_STOPPED;

    const average = getAverageCpuUsagePerProcess(measures);
    const uiThread = average.find(({processName}) => processName === ThreadNames.ANDROID.UI)?.cpuUsage;
    // most likely this line needs to be updated when we migrate to RN 0.74 with bridgeless mode
    const jsThread = average.find(({processName}) => processName === ThreadNames.RN.JS_ANDROID)?.cpuUsage;
    const cpu = getAverageCpuUsage(measures);
    const fps = getAverageFPSUsage(measures);
    const ram = getAverageRAMUsage(measures);

    return {
        uiThread,
        jsThread,
        cpu,
        fps,
        ram,
    };
};

export {start, stop};
