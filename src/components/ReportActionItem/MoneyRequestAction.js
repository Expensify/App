import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import {withNetwork} from '../OnyxProvider';
import compose from '../../libs/compose';
import ReportPreview from './ReportPreview';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import networkPropTypes from '../networkPropTypes';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import * as IOUUtils from '../../libs/IOUUtils';
import {getThreadForReportActionID, buildOptimisticChatReport} from '../../libs/ReportUtils';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import lodashGet from 'lodash/get';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The ID of the associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** The ID of the associated request report */
    requestReportID: PropTypes.string.isRequired,

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
    iouReport: iouReportPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    network: networkPropTypes.isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    chatReport: {
        participants: [],
    },
    iouReport: {},
    reportActions: {},
    isHovered: false,
    session: {
        email: null,
    },
};

const MoneyRequestAction = (props) => {
    const hasMultipleParticipants = props.chatReport.participants.length > 1;
    const onIOUPreviewPressed = () => {
        // This would ideally be passed as a prop or hooked up via withOnyx so that we are not be triggering a potentially intensive
        // search in an onPress handler, I think this could lead to performance issues but it probably ok for now.
        const thread = getThreadForReportActionID(props.action.reportActionID);
        console.log({thread});
        if (_.isEmpty(thread)) {
            // Since a thread does not exist yet then we need to create it now. This is done by creating the report object
            // and passing the parentReportActionID of the reportAction. OpenReport will then automatically create the thread for us.
            const optimisticThreadReport = buildOptimisticChatReport(
                props.chatReport.participants,
                props.translate('iou.threadReportName', {payee: props.action.actorEmail, comment: props.action.originalMessage.comment}),
                '',
                props.chatReport.policyID,
                props.chatReport.owner,
                props.chatReport.type === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                props.chatReport.oldPolicyName,
                undefined,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                props.action.reportActionID,
            );
            console.log({optimisticThreadReport});
            Report.openReport(
                optimisticThreadReport.reportID,
                [_.reject(optimisticThreadReport.participants, (login) => login === lodashGet(props.session, 'email', ''))],
                optimisticThreadReport,
            );
        }
        if (hasMultipleParticipants) {
            Navigation.navigate(ROUTES.getReportParticipantsRoute(props.chatReportID));
        } else {
            Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
        }
    };

    let shouldShowPendingConversionMessage = false;
    if (
        !_.isEmpty(props.iouReport) &&
        !_.isEmpty(props.reportActions) &&
        props.chatReport.hasOutstandingIOU &&
        props.isMostRecentIOUReportAction &&
        props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        props.network.isOffline
    ) {
        shouldShowPendingConversionMessage = IOUUtils.isIOUReportPendingCurrencyConversion(props.reportActions, props.iouReport);
    }

    return (
        <>
            <IOUPreview
                iouReportID={props.requestReportID}
                chatReportID={props.chatReportID}
                isBillSplit={hasMultipleParticipants}
                action={props.action}
                contextMenuAnchor={props.contextMenuAnchor}
                checkIfContextMenuActive={props.checkIfContextMenuActive}
                shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
                onPreviewPressed={onIOUPreviewPressed}
                containerStyles={[styles.cursorPointer, props.isHovered ? styles.iouPreviewBoxHover : undefined]}
                isHovered={props.isHovered}
            />
            {props.isMostRecentIOUReportAction && !hasMultipleParticipants && (
                <ReportPreview
                    action={props.action}
                    chatReportID={props.chatReportID}
                    iouReportID={props.requestReportID}
                    contextMenuAnchor={props.contextMenuAnchor}
                    onViewDetailsPressed={onIOUPreviewPressed}
                    checkIfContextMenuActive={props.checkIfContextMenuActive}
                    isHovered={props.isHovered}
                />
            )}
        </>
    );
};

MoneyRequestAction.propTypes = propTypes;
MoneyRequestAction.defaultProps = defaultProps;
MoneyRequestAction.displayName = 'MoneyRequestAction';

export default compose(
    withLocalize,
    withOnyx({
        chatReport: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
        },
        iouReport: {
            key: ({requestReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${requestReportID}`,
        },
        reportActions: {
            key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            canEvict: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
    withNetwork(),
)(MoneyRequestAction);
