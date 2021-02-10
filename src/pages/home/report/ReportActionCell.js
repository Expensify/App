import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    // The ID of the report that this ReportActionCell is contained in.
    reportID: PropTypes.number.isRequired,

    // The ID of the ReportAction contained within this cell.
    reportActionID: PropTypes.number.isRequired,

    // The default styles to apply to this component
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

    /* Onyx Props */

    // The active reportActionID (there is only one active at a time, bound to Onyx).
    activeReportActionID: PropTypes.number,
};

const defaultProps = {
    style: {},
    activeReportActionID: null,
};

class ReportActionCell extends Component {
    shouldComponentUpdate(nextProps) {
        const willActiveReportActionChange = this.props.activeReportActionID !== nextProps.activeReportActionID;
        const willAffectThisCell = (
            this.props.reportActionID === this.props.activeReportActionID
            || this.props.reportActionID === nextProps.activeReportActionID
        );
        // eslint-disable-next-line no-console
        console.log(
            'RORY_DEBUG: shouldComponentUpdate?',
            `reportActionID: ${this.props.reportActionID}`,
            `current activeReportActionID: ${this.props.activeReportActionID}`,
            `next activeReportActionID: ${nextProps.activeReportActionID}`,
            `willActiveReportActionChange: ${willActiveReportActionChange}`,
            `willAffectThisCell: ${willAffectThisCell}`,
        );
        return willActiveReportActionChange && willAffectThisCell;
    }

    render() {
        const isActive = this.props.reportActionID === this.props.activeReportActionID;
        const cellStyle = [this.props.style, {zIndex: isActive ? 1 : 0}];

        // eslint-disable-next-line react/jsx-props-no-spreading
        return <View style={cellStyle} {...this.props} />;
    }
}

ReportActionCell.propTypes = propTypes;
ReportActionCell.defaultProps = defaultProps;
ReportActionCell.displayName = 'ReportActionCell';

export default withOnyx({
    activeReportActionID: {key: ONYXKEYS.ACTIVE_REPORT_ACTION_ID},
})(ReportActionCell);
