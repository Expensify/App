import useIsArchived from '@hooks/useIsArchived';
import useOnyx from '@hooks/useOnyx';
import {getSortedReportActions, shouldReportActionBeVisibleAsLastAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useOptionReportActions(reportID: string) {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const isReportArchived = useIsArchived(reportID);

    if (!reportActions) {
        return undefined;
    }

    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);
    const sortedReportActions = getSortedReportActions(Object.values(reportActions));
    const reportActionsToDisplay = sortedReportActions.filter(
        (reportAction) => shouldReportActionBeVisibleAsLastAction(reportAction, canPerformWriteAction) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
    );

    return reportActionsToDisplay;
}

export default useOptionReportActions;
