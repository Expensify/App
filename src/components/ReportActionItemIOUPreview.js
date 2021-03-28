import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReport: PropTypes.bool.isRequired,

    // The report currently being looked at
    report: PropTypes.shape({

        // IOU report ID associated with current report
        iouReportID: PropTypes.number,
    }).isRequired,

    /* --- Onyx Props --- */
    // TODO: Will define IOUPropTypes
    // Active IOU Report for current report
    // eslint-disable-next-line react/forbid-prop-types
    iou: PropTypes.object.isRequired,
};

const ReportActionItemIOUPreview = ({
    action,
    isMostRecentIOUReport,
    report,
    iou,
}) => (
    <ReportActionItemIOUQuote action={action} />
);

ReportActionItemIOUPreview.propTypes = propTypes;
ReportActionItemIOUPreview.displayName = 'ReportActionItemIOUPreview';

export default withOnyx({
    iou: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${report.iouReportID}`,
    },
})(ReportActionItemIOUPreview);
