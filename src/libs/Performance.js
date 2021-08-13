import _ from 'underscore';
import lodashTransform from 'lodash/transform';
import CONFIG from '../CONFIG';

/**
 * Deep diff between two objects. Useful for figuring out what changed about an object from one render to the next so
 * that state and props updates can be optimized.
 *
 * @param  {Object} object
 * @param  {Object} base
 * @return {Object}
 */
function diffObject(object, base) {
    function changes(obj, comparisonObject) {
        return lodashTransform(obj, (result, value, key) => {
            if (!_.isEqual(value, comparisonObject[key])) {
                // eslint-disable-next-line no-param-reassign
                result[key] = (
                    _.isObject(value) && _.isObject(comparisonObject[key]))
                    ? changes(value, comparisonObject[key])
                    : value;
            }
        });
    }
    return changes(object, base);
}

/**
 * Enables capturing performance stats.
 *
 * @returns {Boolean}
 */
function canCapturePerformanceMetrics() {
    return CONFIG.CAPTURE_METRICS;
}

function setupPerformanceObserver() {
    if (!canCapturePerformanceMetrics()) {
        return;
    }

    const performance = require('react-native-performance').default;
    const PerformanceObserver = require('react-native-performance').PerformanceObserver;
    new PerformanceObserver((list) => {
        if (list.getEntries().find(entry => entry.name === 'nativeLaunchEnd')) {
            performance.measure('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');

            // eslint-disable-next-line no-undef
            if (__DEV__) {
                performance.measure('jsBundleDownload', 'downloadStart', 'downloadEnd');
            } else {
                performance.measure('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
            }
        }
    }).observe({type: 'react-native-mark', buffered: true});
}

/**
 * Outputs performance stats. We alert these so that they are easy to access in release builds.
 */
function printPerformanceMetrics() {
    const performance = require('react-native-performance').default;
    const entries = _.map(performance.getEntriesByType('measure'), entry => ({name: entry.name, duration: Math.floor(entry.duration)}));
    alert(JSON.stringify(entries, null, 4));
}

export {
    diffObject,
    canCapturePerformanceMetrics,
    printPerformanceMetrics,
    setupPerformanceObserver,
};
