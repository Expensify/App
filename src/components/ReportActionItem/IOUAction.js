import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import IOUQuote from './IOUQuote';
import ReportActionPropTypes from '../../../pages/home/report/ReportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';

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
};

const defaultProps = {
    chatReport: {
        participants: [],
    },
};

const IOUAction = ({
    action,
    chatReportID,
    isMostRecentIOUReportAction,
}) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(chatReportID, action.originalMessage.IOUReportID));
    };
    return (
        <>
            <IOUQuote
                action={action}
                shouldShowViewDetailsLink={Boolean(action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
            />
            {isMostRecentIOUReportAction && Boolean(action.originalMessage.IOUReportID) && (
                <IOUPreview
                    iouReportID={action.originalMessage.IOUReportID}
                    chatReportID={chatReportID}
                    onPayButtonPressed={launchDetailsModal}
                    onPreviewPressed={launchDetailsModal}
                />
            )}
        </>
    );
};

IOUAction.propTypes = propTypes;
IOUAction.defaultProps = defaultProps;
IOUAction.displayName = 'IOUAction';

export default withOnyx({
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
})(IOUAction);
