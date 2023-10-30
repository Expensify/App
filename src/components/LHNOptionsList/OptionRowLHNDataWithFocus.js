import PropTypes from 'prop-types';
import React from 'react';
import withCurrentReportID, {withCurrentReportIDDefaultProps, withCurrentReportIDPropTypes} from '@components/withCurrentReportID';
import OptionRowLHNData from './OptionRowLHNData';

const propTypes = {
    ...withCurrentReportIDPropTypes,
    shouldDisableFocusOptions: PropTypes.bool,
};

const defaultProps = {
    ...withCurrentReportIDDefaultProps,
    shouldDisableFocusOptions: false,
};

/**
 * Wrapper component for OptionRowLHNData that calculates isFocused prop based on currentReportID.
 * This is extracted from OptionRowLHNData to prevent unnecessary re-renders when currentReportID changes.
 * @returns {React.Component} OptionRowLHNData component with isFocused prop
 */
function OptionRowLHNDataWithFocus({currentReportID, shouldDisableFocusOptions, ...props}) {
    // We only want to pass a boolean to the memoized component,
    // instead of a changing number (so we prevent unnecessary re-renders).
    const isFocused = !shouldDisableFocusOptions && currentReportID === props.reportID;

    return (
        <OptionRowLHNData
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isFocused={isFocused}
        />
    );
}

OptionRowLHNDataWithFocus.defaultProps = defaultProps;
OptionRowLHNDataWithFocus.propTypes = propTypes;
OptionRowLHNDataWithFocus.displayName = 'OptionRowLHNDataWithFocus';

export default withCurrentReportID(OptionRowLHNDataWithFocus);
