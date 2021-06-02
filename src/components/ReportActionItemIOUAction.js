import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from './ReportActionItemIOUPreview';
import Navigation from '../libs/Navigation/Navigation';
import compose from '../libs/compose';
import ROUTES from '../ROUTES';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.number.isRequired,

    /** Is this IOUACTION the most recent? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: PropTypes.shape({
        /** The participants of this report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    /** iouReport associated with this iouAction */
    iouReport: PropTypes.shape({
        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,

        /** Has the iouReport been paid? */
        isPaid: PropTypes.bool,
    }),
};

const defaultProps = {
    chatReport: {
        participants: [],
    },
    iouReport: {},
};

const ReportActionItemIOUAction = ({
    action,
    chatReportID,
    chatReport,
    iouReport,
    isMostRecentIOUReportAction,
}) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(chatReportID, action.originalMessage.IOUReportID));
    };
    const hasMultipleParticipants = lodashGet(chatReport, 'participants', []).length >= 2;
    return (
        <>
            <ReportActionItemIOUQuote
                action={action}
                shouldShowViewDetailsLink={!hasMultipleParticipants}
                onViewDetailsPressed={launchDetailsModal}
            />
            {isMostRecentIOUReportAction && (iouReport.hasOutstandingIOU || iouReport.isPaid) && (
                <ReportActionItemIOUPreview
                    iouReportID={action.originalMessage.IOUReportID}
                    chatReportID={chatReportID}
                    onPayButtonPressed={launchDetailsModal}
                />
            )}
        </>
    );
};

ReportActionItemIOUAction.propTypes = propTypes;
ReportActionItemIOUAction.defaultProps = defaultProps;
ReportActionItemIOUAction.displayName = 'ReportActionItemIOUAction';

export default compose(
    withOnyx({
        chatReport: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
        },
    }),
    withOnyx({
        iouReport: {
            key: ({chatReport}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${chatReport.iouReportID}`,
        },
    }),
)(ReportActionItemIOUAction);
