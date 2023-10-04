import React from 'react';
import PropTypes from 'prop-types';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../withCurrentReportID';
import OptionRowLHNData from './OptionRowLHNData';

const propTypes = {
    ...withCurrentReportIDPropTypes,
    shouldDisableFocusOptions: PropTypes.bool,
};

const defaultProps = {
    ...withCurrentReportIDDefaultProps,
    shouldDisableFocusOptions: false,
};

function OptionRowLHNDataWithFocus({currentReportID, shouldDisableFocusOptions, ...props}) {
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
