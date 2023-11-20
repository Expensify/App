import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import refPropTypes from '@components/refPropTypes';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import MoneyRequestPreview from './MoneyRequestPreview';

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

    /** Whether a message is a whisper */
    isWhisper: PropTypes.bool,

    /** Styles to be assigned to Container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    chatReport: {},
    iouReport: {},
    reportActions: {},
    isHovered: false,
    style: [],
    isWhisper: false,
};

function MoneyRequestAction({
    action,
    chatReportID,
    requestReportID,
    isMostRecentIOUReportAction,
    contextMenuAnchor,
    checkIfContextMenuActive,
    chatReport,
    iouReport,
    reportActions,
    isHovered,
    network,
    style,
    isWhisper,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isSplitBillAction = lodashGet(action, 'originalMessage.type', '') === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;

    const onMoneyRequestPreviewPressed = () => {
        if (isSplitBillAction) {
            const reportActionID = lodashGet(action, 'reportActionID', '0');
            Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, reportActionID));
            return;
        }

        // If the childReportID is not present, we need to create a new thread
        const childReportID = lodashGet(action, 'childReportID', 0);
        if (!childReportID) {
            const thread = ReportUtils.buildTransactionThread(action, requestReportID);
            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread.participantAccountIDs);
            Report.openReport(thread.reportID, userLogins, thread, action.reportActionID);
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(thread.reportID));
            return;
        }
        Report.openReport(childReportID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    };

    let shouldShowPendingConversionMessage = false;
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(action);
    const isReversedTransaction = ReportActionsUtils.isReversedTransaction(action);
    if (
        !_.isEmpty(iouReport) &&
        !_.isEmpty(reportActions) &&
        chatReport.hasOutstandingIOU &&
        isMostRecentIOUReportAction &&
        action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        network.isOffline
    ) {
        shouldShowPendingConversionMessage = IOUUtils.isIOUReportPendingCurrencyConversion(iouReport);
    }

    return isDeletedParentAction || isReversedTransaction ? (
        <RenderHTML html={`<comment>${translate(isReversedTransaction ? 'parentReportAction.reversedTransaction' : 'parentReportAction.deletedRequest')}</comment>`} />
    ) : (
        <MoneyRequestPreview
            iouReportID={requestReportID}
            chatReportID={chatReportID}
            isBillSplit={isSplitBillAction}
            action={action}
            contextMenuAnchor={contextMenuAnchor}
            checkIfContextMenuActive={checkIfContextMenuActive}
            shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
            onPreviewPressed={onMoneyRequestPreviewPressed}
            containerStyles={[styles.cursorPointer, isHovered ? styles.reportPreviewBoxHoverBorder : undefined, ...style]}
            isHovered={isHovered}
            isWhisper={isWhisper}
        />
    );
}

MoneyRequestAction.propTypes = propTypes;
MoneyRequestAction.defaultProps = defaultProps;
MoneyRequestAction.displayName = 'MoneyRequestAction';

export default compose(
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
    }),
    withNetwork(),
)(MoneyRequestAction);
