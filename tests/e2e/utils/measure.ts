import {profiler} from '@perf-profiler/profiler';
import {getAverageCpuUsage, getAverageFPSUsage, getAverageRAMUsage} from '@perf-profiler/reporter';
import type {Measure} from '@perf-profiler/types';
import noop from 'lodash/noop';

let measures: Measure[] = [];
let polling = {
    stop: noop,
};

const start = (bundleId: string) => {
    console.log(12121212, 'start');

    // clear our measurements results
    measures = [];

    console.log('11111!! clean');

    polling = profiler.pollPerformanceMeasures(bundleId, {
        onMeasure: (measure: Measure) => {
            measures.push(measure);

            console.log(989898, measures.length);
            // console.log(`JS Thread CPU Usage: ${measure.cpu.perName[ThreadNames.RN.JS_ANDROID]}%`);
            // console.log(`RAM Usage: ${measure.ram}MB`);
        },
    });
};

const stop = () => {
    polling.stop();

    const cpu = getAverageCpuUsage(measures);
    const fps = getAverageFPSUsage(measures);
    const ram = getAverageRAMUsage(measures);

    console.log(`Average CPU Usage: ${cpu}%`);
    console.log(`Average FPS: ${fps}`);
    console.log(`Average RAM Usage: ${ram}MB`);

    return {
        cpu,
        fps,
        ram,
    };
};

export {start, stop};
