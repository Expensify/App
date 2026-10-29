import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {ReportActionWithoutThreadReplyCounters} from '@selectors/ReportAction';
import type {OnyxEntry} from 'react-native-onyx';

import {getParentReportActionSelector, getParentReportActionWithoutThreadRepliesSelector} from '@selectors/ReportAction';

import useOnyx from './useOnyx';

type UseParentReportActionOptions = {
    shouldIgnoreThreadReplies?: boolean;
};

/** The only report fields the hook reads, so callers can pass a narrowed report projection. */
type ParentReportFields = Pick<Report, 'parentReportID' | 'parentReportActionID'>;

function useParentReportAction(report: OnyxEntry<ParentReportFields>): OnyxEntry<ReportAction>;
function useParentReportAction(report: OnyxEntry<ParentReportFields>, options: UseParentReportActionOptions): ReportActionWithoutThreadReplyCounters | undefined;
function useParentReportAction(report: OnyxEntry<ParentReportFields>, {shouldIgnoreThreadReplies = false}: UseParentReportActionOptions = {}) {
    const getParentReportAction = (parentReportActions: OnyxEntry<ReportActions>) =>
        shouldIgnoreThreadReplies
            ? getParentReportActionWithoutThreadRepliesSelector(parentReportActions, report?.parentReportActionID)
            : getParentReportActionSelector(parentReportActions, report?.parentReportActionID);

    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
        selector: getParentReportAction,
    });

    return parentReportAction;
}

export default useParentReportAction;
