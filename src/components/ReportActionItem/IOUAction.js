import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import CONST from '../../CONST';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Is this IOUACTION the most recent? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: PropTypes.shape({
        /** The participants of this report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }),

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

};

const defaultProps = {
    chatReport: {
        participants: [],
    },
    isHovered: false,
};

const IOUAction = (props) => {
    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
    };

    const shouldShowIOUPreview = (props.isMostRecentIOUReportAction
        && Boolean(props.action.originalMessage.IOUReportID))
      || props.action.originalMessage.type === 'pay';

    let hasRequestsInDifferentCurrency = false;
    if (props.chatReport.hasOutstandingIOU && shouldShowIOUPreview) {
        const pendingActionsWithDifferentCurrency = _.chain(props.reportActions)
            .filter(action => action.originalMessage)
            .filter(action => action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL)
            .filter(action => action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && action.originalMessage.currency !== props.iouReport.currency)
            .value();

        hasRequestsInDifferentCurrency = pendingActionsWithDifferentCurrency.length > 0;
    }

    return (
        <>
            <IOUQuote
                action={props.action}
                shouldAllowViewDetails={Boolean(props.action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
            />
            {shouldShowIOUPreview && (
            <IOUPreview
                pendingAction={lodashGet(props.action, 'pendingAction', null)}
                iouReportID={props.action.originalMessage.IOUReportID.toString()}
                chatReportID={props.chatReportID}
                hasRequestInDifferentCurrency={hasRequestsInDifferentCurrency}
                onPayButtonPressed={launchDetailsModal}
                onPreviewPressed={launchDetailsModal}
                containerStyles={[
                    styles.cursorPointer,
                    props.isHovered
                        ? styles.iouPreviewBoxHover
                        : undefined,
                ]}
                isHovered={props.isHovered}
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
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(IOUAction);
