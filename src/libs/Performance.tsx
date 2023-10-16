import React, {Profiler, forwardRef} from 'react';
import {Alert, InteractionManager} from 'react-native';
import lodashTransform from 'lodash/transform';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import {Performance as RNPerformance, PerformanceEntry, PerformanceMark, PerformanceMeasure} from 'react-native-performance';
import {PerformanceObserverEntryList} from 'react-native-performance/lib/typescript/performance-observer';

import * as Metrics from './Metrics';
import getComponentDisplayName from './getComponentDisplayName';
import CONST from '../CONST';
import isE2ETestSession from './E2E/isE2ETestSession';

type WrappedComponentConfig = {id: string};

type PerformanceEntriesCallback = (entry: PerformanceEntry) => void;

type Phase = 'mount' | 'update';

type WithRenderTraceHOC = <P extends Record<string, unknown>>(WrappedComponent: React.ComponentType<P>) => React.ComponentType<P & React.RefAttributes<unknown>>;

type BlankHOC = <P extends Record<string, unknown>>(Component: React.ComponentType<P>) => React.ComponentType<P>;

type SetupPerformanceObserver = () => void;
type DiffObject = (object: Record<string, unknown>, base: Record<string, unknown>) => Record<string, unknown>;
type GetPerformanceMetrics = () => PerformanceEntry[];
type PrintPerformanceMetrics = () => void;
type MarkStart = (name: string, detail?: Record<string, unknown>) => PerformanceMark | void;
type MarkEnd = (name: string, detail?: Record<string, unknown>) => PerformanceMark | void;
type MeasureFailSafe = (measureName: string, startOrMeasureOptions: string, endMark: string) => void;
type MeasureTTI = (endMark: string) => void;
type TraceRender = (id: string, phase: Phase, actualDuration: number, baseDuration: number, startTime: number, commitTime: number, interactions: Set<unknown>) => PerformanceMeasure | void;
type WithRenderTrace = ({id}: WrappedComponentConfig) => WithRenderTraceHOC | BlankHOC;
type SubscribeToMeasurements = (callback: PerformanceEntriesCallback) => void;

type PerformanceModule = {
    diffObject: DiffObject;
    setupPerformanceObserver: SetupPerformanceObserver;
    getPerformanceMetrics: GetPerformanceMetrics;
    printPerformanceMetrics: PrintPerformanceMetrics;
    markStart: MarkStart;
    markEnd: MarkEnd;
    measureFailSafe: MeasureFailSafe;
    measureTTI: MeasureTTI;
    traceRender: TraceRender;
    withRenderTrace: WithRenderTrace;
    subscribeToMeasurements: SubscribeToMeasurements;
};

let rnPerformance: RNPerformance;

/**
 * Deep diff between two objects. Useful for figuring out what changed about an object from one render to the next so
 * that state and props updates can be optimized.
 */
function diffObject(object: Record<string, unknown>, base: Record<string, unknown>): Record<string, unknown> {
    function changes(obj: Record<string, unknown>, comparisonObject: Record<string, unknown>): Record<string, unknown> {
        return lodashTransform(obj, (result, value, key) => {
            if (isEqual(value, comparisonObject[key])) {
                return;
            }

            // eslint-disable-next-line no-param-reassign
            result[key] = isObject(value) && isObject(comparisonObject[key]) ? changes(value as Record<string, unknown>, comparisonObject[key] as Record<string, unknown>) : value;
        });
    }
    return changes(object, base);
}

const Performance: PerformanceModule = {
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
    withRenderTrace:
        () =>
        // eslint-disable-next-line @typescript-eslint/naming-convention
        <P extends Record<string, unknown>>(Component: React.ComponentType<P>): React.ComponentType<P> =>
            Component,
    subscribeToMeasurements: () => {},
};

if (Metrics.canCapturePerformanceMetrics()) {
    const perfModule = require('react-native-performance');
    perfModule.setResourceLoggingEnabled(true);
    rnPerformance = perfModule.default;

    Performance.measureFailSafe = (measureName: string, startOrMeasureOptions: string, endMark: string) => {
        try {
            rnPerformance.measure(measureName, startOrMeasureOptions, endMark);
        } catch (error) {
            // Sometimes there might be no start mark recorded and the measure will fail with an error
            if (error instanceof Error) {
                console.debug(error.message);
            }
        }
    };

    /**
     * Measures the TTI time. To be called when the app is considered to be interactive.
     */
    Performance.measureTTI = (endMark: string) => {
        // Make sure TTI is captured when the app is really usable
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                Performance.measureFailSafe('TTI', 'nativeLaunchStart', endMark);

                // we don't want the alert to show on an e2e test session
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
        new perfModule.PerformanceObserver((list: PerformanceObserverEntryList, observer: PerformanceObserver) => {
            list.getEntries().forEach((entry: PerformanceEntry) => {
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
        new perfModule.PerformanceObserver((list: PerformanceObserverEntryList) => {
            list.getEntriesByType('mark').forEach((mark: PerformanceEntry) => {
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

    Performance.getPerformanceMetrics = (): PerformanceEntry[] =>
        [
            ...rnPerformance.getEntriesByName('nativeLaunch'),
            ...rnPerformance.getEntriesByName('runJsBundle'),
            ...rnPerformance.getEntriesByName('jsBundleDownload'),
            ...rnPerformance.getEntriesByName('TTI'),
            ...rnPerformance.getEntriesByName('regularAppStart'),
            ...rnPerformance.getEntriesByName('appStartedToReady'),
        ].filter((entry) => entry.duration > 0);

    /**
     * Outputs performance stats. We alert these so that they are easy to access in release builds.
     */
    Performance.printPerformanceMetrics = () => {
        const stats = Performance.getPerformanceMetrics();
        const statsAsText = stats.map((entry) => `\u2022 ${entry.name}: ${entry.duration.toFixed(1)}ms`).join('\n');

        if (stats.length > 0) {
            Alert.alert('Performance', statsAsText);
        }
    };

    Performance.subscribeToMeasurements = (callback: PerformanceEntriesCallback) => {
        new perfModule.PerformanceObserver((list: PerformanceObserverEntryList) => {
            list.getEntriesByType('measure').forEach(callback);
        }).observe({type: 'measure', buffered: true});
    };

    /**
     * Add a start mark to the performance entries
     */
    Performance.markStart = (name: string, detail?: Record<string, unknown>): PerformanceMark => rnPerformance.mark(`${name}_start`, {detail});

    /**
     * Add an end mark to the performance entries
     * A measure between start and end is captured automatically
     */
    Performance.markEnd = (name: string, detail?: Record<string, unknown>): PerformanceMark => rnPerformance.mark(`${name}_end`, {detail});

    /**
     * Put data emitted by Profiler components on the timeline
     * @param id the "id" prop of the Profiler tree that has just committed
     * @param phase either "mount" (if the tree just mounted) or "update" (if it re-rendered)
     * @param actualDuration time spent rendering the committed update
     * @param baseDuration estimated time to render the entire subtree without memoization
     * @param startTime when React began rendering this update
     * @param commitTime when React committed this update
     * @param interactions the Set of interactions belonging to this update
     */
    Performance.traceRender = (
        id: string,
        phase: Phase,
        actualDuration: number,
        baseDuration: number,
        startTime: number,
        commitTime: number,
        interactions: Set<unknown>,
    ): PerformanceMeasure =>
        rnPerformance.measure(id, {
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
     */
    Performance.withRenderTrace =
        ({id}: WrappedComponentConfig) =>
        // eslint-disable-next-line @typescript-eslint/naming-convention
        <P extends Record<string, unknown>>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P & React.RefAttributes<unknown>> => {
            const WithRenderTrace: React.ComponentType<P & React.RefAttributes<unknown>> = forwardRef((props: P, ref) => (
                <Profiler
                    id={id}
                    onRender={Performance.traceRender}
                >
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        ref={ref}
                    />
                </Profiler>
            ));

            WithRenderTrace.displayName = `withRenderTrace(${getComponentDisplayName(WrappedComponent as React.ComponentType)})`;
            return WithRenderTrace;
        };
}

export default Performance;
