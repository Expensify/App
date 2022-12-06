import React from 'react';
import {PerformanceProfiler as RNPerformanceProfiler, LogLevel} from '@shopify/react-native-performance';
import PropTypes from 'prop-types';

const onReportPrepared = () => {
    // console.log(report);
};

const propTypes = {
    children: PropTypes.node.isRequired,
};

// TODO: does this implementation work on web as well?
const PerformanceProfiler = props => (
    <RNPerformanceProfiler onReportPrepared={onReportPrepared} renderTimeoutMillis={20_000} logLevel={LogLevel.Debug}>
        {props.children}
    </RNPerformanceProfiler>
);

PerformanceProfiler.propTypes = propTypes;
PerformanceProfiler.displayName = 'PerformanceProfiler';
export default PerformanceProfiler;
