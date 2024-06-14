import type {Performance, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceObserver} from 'react-native-performance';

declare module 'react-native-performance' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ReactNativePerformance {
        default: Performance;
        setResourceLoggingEnabled: (enabled?: boolean) => void;
        PerformanceObserver: typeof PerformanceObserver;
    }

    export type {PerformanceEntry, PerformanceMark, PerformanceMeasure, Performance, ReactNativePerformance};
}
