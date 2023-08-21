import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import {withNetwork} from '../OnyxProvider';
import compose from '../../libs/compose';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import networkPropTypes from '../networkPropTypes';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import IOUPreview from './IOUPreview';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import * as IOUUtils from '../../libs/IOUUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import refPropTypes from '../refPropTypes';
import RenderHTML from '../RenderHTML';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import reportPropTypes from '../../pages/reportPropTypes';

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
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /* Onyx Props */
    /** chatReport associated with iouReport */
    chatReport: reportPropTypes,

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

    /** Styles to be assigned to Container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    chatReport: {},
    iouReport: {},
    reportActions: {},
    isHovered: false,
    session: {
        email: null,
    },
    style: [],
};

function MoneyRequestAction(props) {
    const isSplitBillAction = lodashGet(props.action, 'originalMessage.type', '') === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;

    const onIOUPreviewPressed = () => {
        if (isSplitBillAction) {
            const reportActionID = lodashGet(props.action, 'reportActionID', '0');
            Navigation.navigate(ROUTES.getSplitBillDetailsRoute(props.chatReportID, reportActionID));
            return;
        }

        // If the childReportID is not present, we need to create a new thread
        const childReportID = lodashGet(props.action, 'childReportID', '0');
        if (childReportID === '0') {
            const participantAccountIDs = _.uniq([props.session.accountID, Number(props.action.actorAccountID)]);
            const thread = ReportUtils.buildOptimisticChatReport(
                participantAccountIDs,
                ReportUtils.getTransactionReportName(props.action),
                '',
                lodashGet(props.iouReport, 'policyID', CONST.POLICY.OWNER_EMAIL_FAKE),
                CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
                false,
                '',
                undefined,
                undefined,
                CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                props.action.reportActionID,
                props.requestReportID,
            );

            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread.participantAccountIDs);
            Report.openReport(thread.reportID, userLogins, thread, props.action.reportActionID);
            Navigation.navigate(ROUTES.getReportRoute(thread.reportID));
        } else {
            Report.openReport(childReportID);
            Navigation.navigate(ROUTES.getReportRoute(childReportID));
        }
    };

    let shouldShowPendingConversionMessage = false;
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(props.action);
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

    return isDeletedParentAction ? (
        <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedRequest')}</comment>`} />
    ) : (
        <IOUPreview
            chatReportID={props.chatReportID}
            iouReportID={props.requestReportID}
            isBillSplit={isSplitBillAction}
            action={props.action}
            contextMenuAnchor={props.contextMenuAnchor}
            checkIfContextMenuActive={props.checkIfContextMenuActive}
            shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
            onPreviewPressed={onIOUPreviewPressed}
            containerStyles={[styles.cursorPointer, props.isHovered ? styles.iouPreviewBoxHover : undefined, ...props.style]}
            isHovered={props.isHovered}
        />
    );
}

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
