import {profiler} from '@perf-profiler/profiler';
import {getAverageCpuUsage, getAverageFPSUsage, getAverageRAMUsage} from '@perf-profiler/reporter';
import type {Measure} from '@perf-profiler/types';
import noop from 'lodash/noop';

let measures: Measure[] = [];
let polling = {
    stop: noop,
};

const start = (bundleId: string) => {
    // clear our measurements results
    measures = [];

    polling = profiler.pollPerformanceMeasures(bundleId, {
        onMeasure: (measure: Measure) => {
            measures.push(measure);
        },
    });
};

const stop = () => {
    polling.stop();

    const cpu = getAverageCpuUsage(measures);
    const fps = getAverageFPSUsage(measures);
    const ram = getAverageRAMUsage(measures);

    return {
        cpu,
        fps,
        ram,
    };
};

export {start, stop};
