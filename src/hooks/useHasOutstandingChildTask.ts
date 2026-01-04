import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getReportActionMessage} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Hook to determine if a report has outstanding child tasks
 * @param taskReport - The task report to check
 * @returns boolean indicating if there are outstanding child tasks
 */
function useHasOutstandingChildTask(taskReport: OnyxEntry<Report>): boolean {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport?.parentReportID}`, {
        canBeMissing: true,
    });

    return useMemo(() => {
        if (!taskReport?.parentReportID || !reportActions) {
            return false;
        }

        return Object.values(reportActions).some((reportAction) => {
            if (String(reportAction.childReportID) === String(taskReport?.reportID)) {
                return false;
            }

            if (
                reportAction.childType === CONST.REPORT.TYPE.TASK &&
                reportAction?.childStateNum === CONST.REPORT.STATE_NUM.OPEN &&
                reportAction?.childStatusNum === CONST.REPORT.STATUS_NUM.OPEN &&
                !getReportActionMessage(reportAction)?.isDeletedParentAction
            ) {
                return true;
            }

            return false;
        });
    }, [taskReport?.parentReportID, taskReport?.reportID, reportActions]);
}

export default useHasOutstandingChildTask;
