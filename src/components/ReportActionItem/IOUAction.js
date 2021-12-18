import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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

const IOUAction = (props) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
    };
    return (
        <>
            <IOUQuote
                action={props.action}
                shouldShowViewDetailsLink={Boolean(props.action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
            />
            {((props.isMostRecentIOUReportAction && Boolean(props.action.originalMessage.IOUReportID))
                || (props.action.originalMessage.type === 'pay')) && (
                    <IOUPreview
                        iouReportID={props.action.originalMessage.IOUReportID}
                        chatReportID={props.chatReportID}
                        onPayButtonPressed={launchDetailsModal}
                        onPreviewPressed={launchDetailsModal}
                        containerStyles={[styles.cursorPointer]}
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
