import PropTypes from 'prop-types';
import React, {memo} from 'react';
import _ from 'underscore';
import CONST from '../../../CONST';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import reportPropTypes from '../../reportPropTypes';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** All the data of the action item */
    reportAction: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** Report for this action */
    report: reportPropTypes.isRequired,

    /** Whether the option has an outstanding IOU */
    hasOutstandingIOU: PropTypes.bool,

    /** Sorted actions prepared for display */
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID: PropTypes.string,

    /** If the thread divider line should be hidden */
    shouldHideThreadDividerLine: PropTypes.bool.isRequired,

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: PropTypes.bool.isRequired,
};

const defaultProps = {
    mostRecentIOUReportActionID: '',
    hasOutstandingIOU: false,
};

function ReportActionsListItemRenderer({
    reportAction,
    index,
    report,
    hasOutstandingIOU,
    sortedReportActions,
    mostRecentIOUReportActionID,
    shouldHideThreadDividerLine,
    shouldDisplayNewMarker,
}) {
    const shouldDisplayParentAction =
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED &&
        ReportUtils.isChatThread(report) &&
        !ReportActionsUtils.isTransactionThread(ReportActionsUtils.getParentReportAction(report));

    return shouldDisplayParentAction ? (
        <ReportActionItemParentAction
            shouldHideThreadDividerLine={shouldDisplayParentAction && shouldHideThreadDividerLine}
            reportID={report.reportID}
            parentReportID={`${report.parentReportID}`}
            shouldDisplayNewMarker={shouldDisplayNewMarker}
        />
    ) : (
        <ReportActionItem
            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
            report={report}
            action={reportAction}
            displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(sortedReportActions, index)}
            shouldDisplayNewMarker={shouldDisplayNewMarker}
            shouldShowSubscriptAvatar={
                (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isExpenseReport(report)) &&
                _.contains([CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW], reportAction.actionName)
            }
            isMostRecentIOUReportAction={reportAction.reportActionID === mostRecentIOUReportActionID}
            hasOutstandingIOU={hasOutstandingIOU}
            index={index}
        />
    );
}

ReportActionsListItemRenderer.propTypes = propTypes;
ReportActionsListItemRenderer.defaultProps = defaultProps;
ReportActionsListItemRenderer.displayName = 'ReportActionsListItemRenderer';

export default memo(ReportActionsListItemRenderer);
