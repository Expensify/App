import {PerformanceProfiler as RNPerformanceProfiler, LogLevel} from '@shopify/react-native-performance';

const onReportPrepared = (report) => {
    console.log(report);
};

// TODO: does this implementation work on web as well?
const PerformanceProfiler = children => (
    <RNPerformanceProfiler onReportPrepared={onReportPrepared} logLevel={LogLevel.Info}>
        {children}
    </RNPerformanceProfiler>
);

PerformanceProfiler.displayName = 'PerformanceProfiler';
export default PerformanceProfiler;
