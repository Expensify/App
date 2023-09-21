import React, {memo} from 'react';
import _ from 'underscore';
import CONST from '../../../CONST';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as ReportUtils from '../../../libs/ReportUtils';
import ReportActionItem from './ReportActionItem';
import ReportActionItemParentAction from './ReportActionItemParentAction';

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

export default memo(ReportActionsListItemRenderer);
