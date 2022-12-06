import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import {withNetwork} from '../OnyxProvider';
import compose from '../../libs/compose';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import * as IOUUtils from '../../libs/IOUUtils';

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

        /** Whether the chat report has an outstanding IOU */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** IOU report data object */
    iouReport: PropTypes.shape({
        /** The currency of the iouReport */
        currency: PropTypes.number,
    }).isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    network: {
        isOffline: PropTypes.bool,
    }.isRequired,
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

    const shouldShowIOUPreview = (
        props.isMostRecentIOUReportAction && Boolean(props.action.originalMessage.IOUReportID)
    ) || props.action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY;

    let shouldShowPendingConversionMessage = false;
    if (
        props.iouReport
        && props.chatReport.hasOutstandingIOU
        && props.isMostRecentIOUReportAction
        && props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
    ) {
        if (props.network.isOffline) {
            shouldShowPendingConversionMessage = IOUUtils.isIOUReportPendingCurrencyConversion(props.reportActions, props.iouReport);
        } else {
            // Keep the pending message showing until all report actions in different currency are synced with the server
            const hasPendingRequests = _.chain(
                IOUUtils.getIOUReportActions(props.reportActions, props.iouReport, '', '', true),
            ).some(action => action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD).value();
            shouldShowPendingConversionMessage = hasPendingRequests;
        }
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
                    shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
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

export default compose(
    withOnyx({
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
    }),
    withNetwork(),
)(IOUAction);
