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
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as CurrencyUtils from '../../libs/CurrencyUtils';

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
    const hasMultipleParticipants = lodashGet(props.chatReport, 'participants', []).length > 1;
    const onIOUPreviewPressed = () => {
        if (lodashGet(props.action, 'originalMessage.type', '') === CONST.IOU.REPORT_ACTION_TYPE.SPLIT && hasMultipleParticipants) {
            Navigation.navigate(ROUTES.getReportParticipantsRoute(props.chatReportID));
            return;
        }

        // If the childReportID is not present, we need to create a new thread
        const childReportID = lodashGet(props.action, 'childReportID', '0');
        if (childReportID === '0') {
            const participants = _.uniq([props.session.email, props.action.actorEmail]);
            const formattedUserLogins = _.map(participants, (login) => OptionsListUtils.addSMSDomainIfPhoneNumber(login).toLowerCase());
            const thread = ReportUtils.buildOptimisticChatReport(
                formattedUserLogins,
                props.translate('iou.threadReportName', {
                    formattedAmount: CurrencyUtils.convertToDisplayString(lodashGet(props.action, 'originalMessage.amount', 0), lodashGet(props.action, 'originalMessage.currency', '')),
                    comment: props.action.originalMessage.comment,
                }),
                '',
                CONST.POLICY.OWNER_EMAIL_FAKE,
                CONST.POLICY.OWNER_EMAIL_FAKE,
                false,
                '',
                undefined,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                props.action.reportActionID,
                props.chatReportID, // Needs to be changed to iouReportID
            );

            Report.openReport(thread.reportID, thread.participants, thread, props.action.reportActionID);
            Navigation.navigate(ROUTES.getReportRoute(thread.reportID));
        } else {
            Report.openReport(childReportID);
            Navigation.navigate(ROUTES.getReportRoute(childReportID));
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
