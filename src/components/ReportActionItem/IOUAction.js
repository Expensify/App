import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import IOUQuote from './IOUQuote';
import ReportActionPropTypes from '../../pages/home/report/ReportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

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

    /** Session of currently logged in user */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(PropTypes.shape({

        /** This is either the user's full name, or their login if full name is an empty string */
        displayName: PropTypes.string.isRequired,
    })).isRequired,
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
    chatReport,
    session,
    personalDetails,
}) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(chatReportID, action.originalMessage.IOUReportID));
    };

    const sessionEmail = lodashGet(session, 'email', null);
    const participantName = _.map(chatReport.participants, participant => lodashGet(personalDetails, [participant, 'firstName'], '')
            || Str.removeSMSDomain(participant)).join(', ');

    const currentUserName = lodashGet(personalDetails, [sessionEmail, 'firstName'], '')
                        || Str.removeSMSDomain(sessionEmail);

    return (
        <>
            <IOUQuote
                action={action}
                shouldShowViewDetailsLink={Boolean(action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
                chatReport={chatReport}
                currentUserName={currentUserName}
                participantName={participantName}
                sessionEmail={sessionEmail}
            />
            {((isMostRecentIOUReportAction && Boolean(action.originalMessage.IOUReportID))
                || (action.originalMessage.type === 'pay')) && (
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
    session: {
        key: ONYXKEYS.SESSION,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(IOUAction);
