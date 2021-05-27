import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import ReportActionItemIOUQuote from './ReportActionItemIOUQuote';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';
import ReportActionItemIOUPreview from './ReportActionItemIOUPreview';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.number.isRequired,

    /** Should render the preview Component? */
    shouldDisplayPreview: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** ChatReport associated with iouReport */
    chatReport: PropTypes.shape({
        /** The participants of this report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),
};

const defaultProps = {
    chatReport: {
        participants: [],
    },
};

const ReportActionItemIOUAction = ({
    action,
    chatReportID,
    shouldDisplayPreview,
    chatReport,
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
            {shouldDisplayPreview && (
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

export default withOnyx({
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
})(ReportActionItemIOUAction);
