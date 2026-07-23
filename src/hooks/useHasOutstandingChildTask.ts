import {getReportActionMessage} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

/**
 * Determines if a report has outstanding child tasks based on the parent report's actions
 * @param taskReport - The task report to check
 * @param reportActions - The report actions of the task report's parent report
 * @returns boolean indicating if there are outstanding child tasks
 */
function getHasOutstandingChildTask(taskReport: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>): boolean {
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
}

/**
 * Hook to determine if a report has outstanding child tasks
 * @param taskReport - The task report to check
 * @returns boolean indicating if there are outstanding child tasks
 */
function useHasOutstandingChildTask(taskReport: OnyxEntry<Report>): boolean {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport?.parentReportID}`);

    return useMemo(() => getHasOutstandingChildTask(taskReport, reportActions), [taskReport, reportActions]);
}

export default useHasOutstandingChildTask;
export {getHasOutstandingChildTask};
