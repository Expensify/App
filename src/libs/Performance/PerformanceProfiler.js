import React from 'react';
import {PerformanceProfiler as RNPerformanceProfiler} from '@shopify/react-native-performance';
import PropTypes from 'prop-types';

// eslint-disable-next-line no-unused-vars
const onReportPrepared = (report) => {
    // console.log(`>>${JSON.stringify(report, null, 2).replaceAll('\n', '\n>>')}`);
};

const propTypes = {
    children: PropTypes.node.isRequired,
};

const loggingDisabled = 4;

const PerformanceProfiler = props => (
    <RNPerformanceProfiler onReportPrepared={onReportPrepared} renderTimeoutMillis={20_000} logLevel={loggingDisabled}>
        {props.children}
    </RNPerformanceProfiler>
);

PerformanceProfiler.propTypes = propTypes;
PerformanceProfiler.displayName = 'PerformanceProfiler';
export default PerformanceProfiler;
