import _ from 'underscore';
import lodashTransform from 'lodash/transform';
import React, {Profiler, forwardRef} from 'react';
import {Alert, InteractionManager} from 'react-native';

import * as Metrics from './Metrics';
import getComponentDisplayName from './getComponentDisplayName';
import CONST from '../CONST';
import isE2ETestSession from './E2E/isE2ETestSession';

/** @type {import('react-native-performance').Performance} */
let rnPerformance;

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
            if (_.isEqual(value, comparisonObject[key])) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            result[key] = (_.isObject(value) && _.isObject(comparisonObject[key]))
                ? changes(value, comparisonObject[key])
                : value;
        });
    }
    return changes(object, base);
}

const Performance = {
    // When performance monitoring is disabled the implementations are blank
    diffObject,
    setupPerformanceObserver: () => {},
    getPerformanceMetrics: () => [],
    printPerformanceMetrics: () => {},
    markStart: () => {},
    markEnd: () => {},
    measureFailSafe: () => {},
    measureTTI: () => {},
    traceRender: () => {},
    withRenderTrace: () => Component => Component,
    subscribeToMeasurements: () => {},
};

if (Metrics.canCapturePerformanceMetrics()) {
    const perfModule = require('react-native-performance');
    perfModule.setResourceLoggingEnabled(true);
    rnPerformance = perfModule.default;

    Performance.measureFailSafe = (measureName, startOrMeasureOptions, endMark) => {
        try {
            rnPerformance.measure(measureName, startOrMeasureOptions, endMark);
        } catch (error) {
            // Sometimes there might be no start mark recorded and the measure will fail with an error
            console.debug(error.message);
        }
    };

    /**
     * Measures the TTI time. To be called when the app is considered to be interactive.
     * @param {String} [endMark] Optional end mark name
     */
    Performance.measureTTI = (endMark) => {
        // Make sure TTI is captured when the app is really usable
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                Performance.measureFailSafe('TTI', 'nativeLaunchStart', endMark);

                // we don't want the alert to show on a e2e test sessio
                if (!isE2ETestSession()) {
                    Performance.printPerformanceMetrics();
                }
            });
        });
    };

    /**
     * Sets up an observer to capture events recorded in the native layer before the app fully initializes.
     */
    Performance.setupPerformanceObserver = () => {
        const performanceReported = require('react-native-performance-flipper-reporter');
        performanceReported.setupDefaultFlipperReporter();

        // Monitor some native marks that we want to put on the timeline
        new perfModule.PerformanceObserver((list, observer) => {
            list.getEntries()
                .forEach((entry) => {
                    if (entry.name === 'nativeLaunchEnd') {
                        Performance.measureFailSafe('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');
                    }
                    if (entry.name === 'downloadEnd') {
                        Performance.measureFailSafe('jsBundleDownload', 'downloadStart', 'downloadEnd');
                    }
                    if (entry.name === 'runJsBundleEnd') {
                        Performance.measureFailSafe('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
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
                    if (mark.name.endsWith('_end')) {
                        const end = mark.name;
                        const name = end.replace(/_end$/, '');
                        const start = `${name}_start`;
                        Performance.measureFailSafe(name, start, end);
                    }

                    // Capture any custom measures or metrics below
                    if (mark.name === `${CONST.TIMING.SIDEBAR_LOADED}_end`) {
                        Performance.measureTTI(mark.name);
                    }
                });
        }).observe({type: 'mark', buffered: true});
    };

    Performance.getPerformanceMetrics = () => _.chain([
        ...rnPerformance.getEntriesByName('nativeLaunch'),
        ...rnPerformance.getEntriesByName('runJsBundle'),
        ...rnPerformance.getEntriesByName('jsBundleDownload'),
        ...rnPerformance.getEntriesByName('TTI'),
        ...rnPerformance.getEntriesByName('regularAppStart'),
        ...rnPerformance.getEntriesByName('appStartedToReady'),
    ])
        .filter(entry => entry.duration > 0)
        .value();

    /**
     * Outputs performance stats. We alert these so that they are easy to access in release builds.
     */
    Performance.printPerformanceMetrics = () => {
        const stats = Performance.getPerformanceMetrics();
        const statsAsText = _.map(stats, entry => `\u2022 ${entry.name}: ${entry.duration.toFixed(1)}ms`)
            .join('\n');

        if (stats.length > 0) {
            Alert.alert('Performance', statsAsText);
        }
    };

    Performance.subscribeToMeasurements = (callback) => {
        new perfModule.PerformanceObserver((list) => {
            list.getEntriesByType('measure').forEach(callback);
        }).observe({type: 'measure', buffered: true});
    };

    /**
     * Add a start mark to the performance entries
     * @param {string} name
     * @param {Object} [detail]
     * @returns {PerformanceMark}
     */
    Performance.markStart = (name, detail) => rnPerformance.mark(`${name}_start`, {detail});

    /**
     * Add an end mark to the performance entries
     * A measure between start and end is captured automatically
     * @param {string} name
     * @param {Object} [detail]
     * @returns {PerformanceMark}
     */
    Performance.markEnd = (name, detail) => rnPerformance.mark(`${name}_end`, {detail});

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
    Performance.traceRender = (
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions,
    ) => rnPerformance.measure(id, {
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
    Performance.withRenderTrace = ({id}) => (WrappedComponent) => {
        const WithRenderTrace = forwardRef((props, ref) => (
            <Profiler id={id} onRender={Performance.traceRender}>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <WrappedComponent {...props} ref={ref} />
            </Profiler>
        ));

        WithRenderTrace.displayName = `withRenderTrace(${getComponentDisplayName(WrappedComponent)})`;
        return WithRenderTrace;
    };
}

export default Performance;
