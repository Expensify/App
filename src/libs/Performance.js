import _ from 'underscore';
import lodashTransform from 'lodash/transform';
import React, {Profiler, forwardRef} from 'react';
import {Alert} from 'react-native';

import {canCapturePerformanceMetrics} from './canCaptureMetrics';
import getComponentDisplayName from './getComponentDisplayName';
import CONST from '../CONST';

/** @type {import('react-native-performance').Performance} */
let performance;

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

// When performance monitoring is disabled the implementations are blank
/* eslint-disable import/no-mutable-exports */
let setupPerformanceObserver = () => {};
let printPerformanceMetrics = () => {};
let markStart = () => {};
let markEnd = () => {};
let traceRender = () => {};
let withRenderTrace = () => Component => Component;
/* eslint-enable import/no-mutable-exports */

if (canCapturePerformanceMetrics()) {
    /**
     * Sets up an observer to capture events recorded in the native layer before the app fully initializes.
     */
    setupPerformanceObserver = () => {
        const performanceReported = require('react-native-performance-flipper-reporter');
        performanceReported.setupDefaultFlipperReporter();

        const perfModule = require('react-native-performance');
        perfModule.setResourceLoggingEnabled(true);
        performance = perfModule.default;

        // Monitor some native marks that we want to put on the timeline
        new perfModule.PerformanceObserver((list, observer) => {
            list.getEntries()
                .forEach((entry) => {
                    if (entry.name === 'nativeLaunchEnd') {
                        performance.measure('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');
                    }
                    if (entry.name === 'downloadEnd') {
                        performance.measure('jsBundleDownload', 'downloadStart', 'downloadEnd');
                    }
                    if (entry.name === 'runJsBundleEnd') {
                        performance.measure('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
                    }

                    // We don't need to keep the observer past this point
                    if (entry.name === 'runJsBundleEnd' || entry.name === 'downloadEnd') {
                        observer.disconnect();
                    }
                });
        }).observe({type: 'react-native-mark', buffered: true});

        // Monitor for "_end" marks and capture "_start" to "_end" measures
        new perfModule.PerformanceObserver((list) => {
            list.getEntriesByType('mark')
                .forEach((mark) => {
                    try {
                        if (mark.name.endsWith('_end')) {
                            const end = mark.name;
                            const name = end.replace(/_end$/, '');
                            const start = `${name}_start`;
                            performance.measure(name, start, end);
                        }

                        // Capture any custom measures or metrics below
                        if (mark.name === `${CONST.TIMING.SIDEBAR_LOADED}_end`) {
                            performance.measure('TTI', 'nativeLaunchStart', mark.name);
                            printPerformanceMetrics();
                        }
                    } catch (error) {
                        // Sometimes there might be no start mark recorded and the measure will fail with an error
                        console.debug(error.message);
                    }
                });
        }).observe({type: 'mark', buffered: true});
    };

    /**
     * Outputs performance stats. We alert these so that they are easy to access in release builds.
     */
    printPerformanceMetrics = () => {
        const stats = [
            ...performance.getEntriesByName('nativeLaunch'),
            ...performance.getEntriesByName('runJsBundle'),
            ...performance.getEntriesByName('jsBundleDownload'),
            ...performance.getEntriesByName('TTI'),
        ]
            .filter(entry => entry.duration > 0)
            .map(entry => `\u2022 ${entry.name}: ${entry.duration.toFixed(1)}ms`);

        Alert.alert('Performance', stats.join('\n'));
    };

    /**
     * Add a start mark to the performance entries
     * @param {string} name
     * @param {Object} [detail]
     * @returns {PerformanceMark}
     */
    markStart = (name, detail) => performance.mark(`${name}_start`, {detail});

    /**
     * Add an end mark to the performance entries
     * A measure between start and end is captured automatically
     * @param {string} name
     * @param {Object} [detail]
     * @returns {PerformanceMark}
     */
    markEnd = (name, detail) => performance.mark(`${name}_end`, {detail});

    /**
     * Put data emitted by Profiler components on the timeline
     * @param {string} id the "id" prop of the Profiler tree that has just committed
     * @param {'mount'|'update'} phase either "mount" (if the tree just mounted) or "update" (if it re-rendered)
     * @param {number} actualDuration time spent rendering the committed update
     * @param {number} baseDuration estimated time to render the entire subtree without memoization
     * @param {number} startTime when React began rendering this update
     * @param {number} commitTime when React committed this update
     * @param {Set} interactions the Set of interactions belonging to this update
     * @returns {PerformanceMeasure}
     */
    traceRender = (
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions,
    ) => performance.measure(id, {
        start: startTime,
        duration: actualDuration,
        detail: {
            phase,
            baseDuration,
            commitTime,
            interactions,
        },
    });

    /**
     * A HOC that captures render timings of the Wrapped component
     * @param {object} config
     * @param {string} config.id
     * @returns {function(React.Component): React.FunctionComponent}
     */
    withRenderTrace = ({id}) => (WrappedComponent) => {
        const WithRenderTrace = forwardRef((props, ref) => (
            <Profiler id={id} onRender={traceRender}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <WrappedComponent {...props} ref={ref} />
            </Profiler>
        ));

        WithRenderTrace.displayName = `withRenderTrace(${getComponentDisplayName(WrappedComponent)})`;
        return WithRenderTrace;
    };
}

export {
    diffObject,
    printPerformanceMetrics,
    setupPerformanceObserver,
    markStart,
    markEnd,
    traceRender,
    withRenderTrace,
};
