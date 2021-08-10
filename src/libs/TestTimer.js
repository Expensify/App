import Onyx from 'react-native-onyx';
import performance from 'react-native-performance';
import _ from 'underscore';

const keys = [];

function start(eventName) {
    performance.mark(`${eventName}-mark`);
    keys.push(eventName);
}

function stop(eventName) {
    performance.measure(eventName, `${eventName}-mark`);
}

function printMetrics() {
    const measures = {};

    _.each(keys, (key) => {
        measures[key] = performance.getEntriesByName(key);
    });

    Onyx.set('test_metrics', JSON.stringify(measures));
}

export default {
    start,
    stop,
    printMetrics,
};
