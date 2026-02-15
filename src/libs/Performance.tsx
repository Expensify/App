import {deepEqual} from 'fast-equals';
import isObject from 'lodash/isObject';
import lodashTransform from 'lodash/transform';
import React, {Profiler} from 'react';
import {Alert, InteractionManager} from 'react-native';
import performance, {PerformanceObserver, setResourceLoggingEnabled} from 'react-native-performance';
import type {PerformanceEntry, PerformanceMark, PerformanceMeasure} from 'react-native-performance';
import CONST from '@src/CONST';
import isE2ETestSession from './E2E/isE2ETestSession';
import getComponentDisplayName from './getComponentDisplayName';
import canCapturePerformanceMetrics from './Metrics';

/**
 * Deep diff between two objects. Useful for figuring out what changed about an object from one render to the next so
 * that state and props updates can be optimized.
 */
function diffObject(object: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown> {
    function changes(obj: Record<string, unknown>, comparisonObject: Record<string, unknown>): Record<string, unknown> {
        return lodashTransform(obj, (result, value, key) => {
            if (deepEqual(value, comparisonObject[key])) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            result[key] = isObject(value) && isObject(comparisonObject[key]) ? changes(value as Record<string, unknown>, comparisonObject[key] as Record<string, unknown>) : value;
        });
    }
    return changes(object, base);
}

function measureFailSafe(measureName: string, startOrMeasureOptions: string, endMark?: string): void {
    try {
        performance.measure(measureName, startOrMeasureOptions, endMark);
    } catch (error) {
        // Sometimes there might be no start mark recorded and the measure will fail with an error
        if (error instanceof Error) {
            console.debug(error.message);
        }
    }
}

/**
 * Measures the TTI (time to interactive) time starting from the `nativeLaunchStart` event.
 * To be called when the app is considered to be interactive.
 */
function measureTTI(endMark?: string): void {
    // Make sure TTI is captured when the app is really usable
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
            measureFailSafe('TTI', 'nativeLaunchStart', endMark);

            // We don't want an alert to show:
            // - on builds with performance metrics collection disabled by a feature flag
            // - e2e test sessions
            if (!canCapturePerformanceMetrics() || isE2ETestSession()) {
                return;
            }

            printPerformanceMetrics();
        });
    });
}

/*
 * Monitor native marks that we want to put on the timeline
 */
const nativeMarksObserver = new PerformanceObserver((list, _observer) => {
    for (const entry of list.getEntries()) {
        if (entry.name === 'nativeLaunchEnd') {
            measureFailSafe('nativeLaunch', 'nativeLaunchStart', 'nativeLaunchEnd');
        }
        if (entry.name === 'downloadEnd') {
            measureFailSafe('jsBundleDownload', 'downloadStart', 'downloadEnd');
        }
        if (entry.name === 'runJsBundleEnd') {
            measureFailSafe('runJsBundle', 'runJsBundleStart', 'runJsBundleEnd');
        }
        if (entry.name === 'appCreationEnd') {
            measureFailSafe('appCreation', 'appCreationStart', 'appCreationEnd');
            measureFailSafe('nativeLaunchEnd_To_appCreationStart', 'nativeLaunchEnd', 'appCreationStart');
        }
        if (entry.name === 'contentAppeared') {
            measureFailSafe('appCreationEnd_To_contentAppeared', 'appCreationEnd', 'contentAppeared');
        }

        // At this point we've captured and processed all the native marks we're interested in
        // and are not expecting to have more thus we can safely disconnect the observer
        if (entry.name === 'runJsBundleEnd' || entry.name === 'downloadEnd') {
            _observer.disconnect();
        }
    }
});

function setNativeMarksObserverEnabled(enabled = false): void {
    if (!enabled) {
        nativeMarksObserver.disconnect();
        return;
    }

    nativeMarksObserver.disconnect();
    nativeMarksObserver.observe({type: 'react-native-mark', buffered: true});
}

/**
 * Monitor for "_end" marks and capture "_start" to "_end" measures, including events recorded in the native layer before the app fully initializes.
 */
const customMarksObserver = new PerformanceObserver((list) => {
    for (const mark of list.getEntriesByType('mark')) {
        if (mark.name.endsWith('_end')) {
            const end = mark.name;
            const name = end.replaceAll(/_end$/g, '');
            const start = `${name}_start`;
            measureFailSafe(name, start, end);
        }

        // Capture any custom measures or metrics below
        if (mark.name === `${CONST.TIMING.SIDEBAR_LOADED}_end`) {
            measureFailSafe('contentAppeared_To_screenTTI', 'contentAppeared', mark.name);
            measureTTI(mark.name);
        }
    }
});

function setCustomMarksObserverEnabled(enabled = false): void {
    if (!enabled) {
        customMarksObserver.disconnect();
        return;
    }

    customMarksObserver.disconnect();
    customMarksObserver.observe({type: 'mark', buffered: true});
}

function getPerformanceMetrics(): PerformanceEntry[] {
    return [
        ...performance.getEntriesByName('nativeLaunch'),
        ...performance.getEntriesByName('nativeLaunchEnd_To_appCreationStart'),
        ...performance.getEntriesByName('appCreation'),
        ...performance.getEntriesByName('appCreationEnd_To_contentAppeared'),
        ...performance.getEntriesByName('contentAppeared_To_screenTTI'),
        ...performance.getEntriesByName('runJsBundle'),
        ...performance.getEntriesByName('jsBundleDownload'),
        ...performance.getEntriesByName('TTI'),
        ...performance.getEntriesByName('regularAppStart'),
        ...performance.getEntriesByName('appStartedToReady'),
    ].filter((entry) => entry.duration > 0);
}

function getPerformanceMeasures(): PerformanceEntry[] {
    return performance.getEntriesByType('measure');
}

/**
 * Outputs performance stats. We alert these so that they are easy to access in release builds.
 */
function printPerformanceMetrics(): void {
    const stats = getPerformanceMetrics();
    const statsAsText = stats.map((entry) => `\u2022 ${entry.name}: ${entry.duration.toFixed(1)}ms`).join('\n');

    if (stats.length > 0) {
        Alert.alert('Performance', statsAsText);
    }
}

function subscribeToMeasurements(callback: (entry: PerformanceEntry) => void): () => void {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntriesByType('measure')) {
            callback(entry);
        }
    });

    observer.observe({type: 'measure', buffered: true});

    return () => observer.disconnect();
}

/**
 * Add a start mark to the performance entries
 */
function markStart(name: string, detail?: Record<string, unknown>): PerformanceMark {
    return performance.mark(`${name}_start`, {detail});
}

/**
 * Add an end mark to the performance entries
 * A measure between start and end is captured automatically
 */
function markEnd(name: string, detail?: Record<string, unknown>): PerformanceMark {
    return performance.mark(`${name}_end`, {detail});
}

type Phase = 'mount' | 'update' | 'nested-update';

/**
 * Put data emitted by Profiler components on the timeline
 * @param id the "id" prop of the Profiler tree that has just committed
 * @param phase either "mount" (if the tree just mounted) or "update" (if it re-rendered)
 * @param actualDuration time spent rendering the committed update
 * @param baseDuration estimated time to render the entire subtree without memoization
 * @param startTime when React began rendering this update
 * @param commitTime when React committed this update
 */
function traceRender(id: string, phase: Phase, actualDuration: number, baseDuration: number, startTime: number, commitTime: number): PerformanceMeasure {
    return performance.measure(id, {
        start: startTime,
        duration: actualDuration,
        detail: {
            phase,
            baseDuration,
            commitTime,
        },
    });
}

type WrappedComponentConfig = {id: string};

/**
 * A HOC that captures render timings of the Wrapped component
 */
function withRenderTrace({id}: WrappedComponentConfig) {
    if (!canCapturePerformanceMetrics()) {
        return <P extends Record<string, unknown>>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> => WrappedComponent;
    }

    return <P extends Record<string, unknown>>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> => {
        function WithRenderTrace(props: P) {
            return (
                <Profiler
                    id={id}
                    onRender={traceRender}
                >
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                    />
                </Profiler>
            );
        }

        WithRenderTrace.displayName = `withRenderTrace(${getComponentDisplayName(WrappedComponent as React.ComponentType)})`;
        return WithRenderTrace;
    };
}

function enableMonitoring() {
    setResourceLoggingEnabled(true);
    setNativeMarksObserverEnabled(true);
    setCustomMarksObserverEnabled(true);
}

function disableMonitoring() {
    setResourceLoggingEnabled(false);
    setNativeMarksObserverEnabled(false);
    setCustomMarksObserverEnabled(false);
}

export default {
    diffObject,
    measureFailSafe,
    measureTTI,
    enableMonitoring,
    disableMonitoring,
    getPerformanceMetrics,
    getPerformanceMeasures,
    printPerformanceMetrics,
    subscribeToMeasurements,
    markStart,
    markEnd,
    withRenderTrace,
};
