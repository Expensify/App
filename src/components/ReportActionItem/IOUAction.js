import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import {withNetwork} from '../OnyxProvider';
import compose from '../../libs/compose';
import IOUQuote from './IOUQuote';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import networkPropTypes from '../networkPropTypes';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import * as IOUUtils from '../../libs/IOUUtils';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The ID of the associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Is this IOUACTION the most recent? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: PropTypes.shape({
        /** The participants of this report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** Whether the chat report has an outstanding IOU */
        hasOutstandingIOU: PropTypes.bool.isRequired,
    }),

    /** IOU report data object */
    iouReport: iouReportPropTypes.isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    network: networkPropTypes.isRequired,
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
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
        props.isMostRecentIOUReportAction
        && Boolean(props.action.originalMessage.IOUReportID)
        && props.chatReport.hasOutstandingIOU) || props.action.originalMessage.type === 'pay';

    let shouldShowPendingConversionMessage = false;
    if (
        props.iouReport
        && props.chatReport.hasOutstandingIOU
        && props.isMostRecentIOUReportAction
        && props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
        && props.network.isOffline
    ) {
        shouldShowPendingConversionMessage = IOUUtils.isIOUReportPendingCurrencyConversion(props.reportActions, props.iouReport);
    }

    return (
        <>
            <IOUQuote
                action={props.action}
                chatReportID={props.chatReportID}
                contextMenuAnchor={props.contextMenuAnchor}
                shouldAllowViewDetails={Boolean(props.action.originalMessage.IOUReportID)}
                onViewDetailsPressed={launchDetailsModal}
                checkIfContextMenuActive={props.checkIfContextMenuActive}
            />
            {shouldShowIOUPreview && (
                <IOUPreview
                    iouReportID={props.action.originalMessage.IOUReportID.toString()}
                    chatReportID={props.chatReportID}
                    action={props.action}
                    contextMenuAnchor={props.contextMenuAnchor}
                    checkIfContextMenuActive={props.checkIfContextMenuActive}
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
            key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT}${action.originalMessage.IOUReportID}`,
        },
        reportActions: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            canEvict: false,
        },
    }),
    withNetwork(),
)(IOUAction);
