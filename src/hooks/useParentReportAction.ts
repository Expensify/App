import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {ReportActionWithoutThreadReplyCounters} from '@selectors/ReportAction';
import type {OnyxEntry} from 'react-native-onyx';

import {getParentReportActionSelector, getParentReportActionWithoutThreadRepliesSelector} from '@selectors/ReportAction';
import {useCallback} from 'react';

import useOnyx from './useOnyx';

type UseParentReportActionOptions = {
    /** Drop the parent action's thread reply counters (`childVisibleActionCount`, ...), so replies in the thread don't re-render the caller. */
    shouldIgnoreThreadReplies?: boolean;
};

function useParentReportAction(report: OnyxEntry<Report>): OnyxEntry<ReportAction>;
function useParentReportAction(report: OnyxEntry<Report>, options: UseParentReportActionOptions): ReportActionWithoutThreadReplyCounters | undefined;
function useParentReportAction(report: OnyxEntry<Report>, {shouldIgnoreThreadReplies = false}: UseParentReportActionOptions = {}) {
    const getParentReportAction = useCallback(
        (parentReportActions: OnyxEntry<ReportActions>) =>
            shouldIgnoreThreadReplies
                ? getParentReportActionWithoutThreadRepliesSelector(parentReportActions, report?.parentReportActionID)
                : getParentReportActionSelector(parentReportActions, report?.parentReportActionID),
        [report?.parentReportActionID, shouldIgnoreThreadReplies],
    );

    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        selector: getParentReportAction,
    });

    return parentReportAction;
}

export default useParentReportAction;
