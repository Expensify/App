import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportActionText, getTextFromHtml} from '@libs/ReportActionMessageUtils';
import {isDeletedAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

type ConciergeThread = {
    /** The thread the question opened */
    reportID: string;

    /** The thread's own name, which Concierge writes from the question, falling back to the question itself */
    title: string;

    /** Whether the thread holds replies the user has not read */
    isUnread: boolean;
};

/**
 * A thread counts as unread while its own report says so. Until the user opens a thread its report is usually not
 * in Onyx at all, so a reply the user has never loaded counts as unread too.
 */
/**
 * A thread carries the generic name until Concierge writes one from the question, so that name is no title at all.
 * A written one holds the question's markup, which has to come out before the name can be read as a line of text.
 */
function getWrittenName(name: string | undefined) {
    if (!name || name === CONST.REPORT.DEFAULT_REPORT_NAME) {
        return undefined;
    }
    return getTextFromHtml(name) || undefined;
}

function getThreadTitle(reports: OnyxCollection<Report>, reportID: string, childReportName: string | undefined, question: string) {
    const threadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return getWrittenName(threadReport?.reportName) ?? getWrittenName(childReportName) ?? question;
}

function getIsThreadUnread(reports: OnyxCollection<Report>, reportID: string, replyCount: number) {
    const threadReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (!threadReport) {
        return replyCount > 0;
    }

    return (threadReport.lastReadTime ?? '') < (threadReport.lastVisibleActionCreated ?? '');
}

/**
 * Lists the Concierge threads, newest first.
 *
 * The threads come from the Concierge chat's own actions rather than from the report collection: Onyx only holds
 * the reports the LHN shows, so a thread's report is usually missing until the user opens it, while the question
 * that opened it is always there and carries the thread's ID.
 */
function useConciergeThreads(conciergeReportID: string | undefined): ConciergeThread[] {
    const [conciergeActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(conciergeReportID)}`);
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    // A question whose comment was deleted has no text left to name its thread with, so it drops off the list.
    const threadActions = Object.values(conciergeActions ?? {}).filter((action) => !!action?.childReportID && !isDeletedAction(action));

    return threadActions
        .sort((first, second) => {
            // Plain string comparison is enough here: these timestamps sort the same way as text and as dates.
            const firstCreated = first.created ?? '';
            const secondCreated = second.created ?? '';
            if (firstCreated === secondCreated) {
                return 0;
            }
            return firstCreated > secondCreated ? -1 : 1;
        })
        .flatMap((action) => {
            if (!action.childReportID) {
                return [];
            }
            const title = getThreadTitle(reports, action.childReportID, action.childReportName, getReportActionText(action));
            if (!title) {
                return [];
            }
            return [
                {
                    reportID: action.childReportID,
                    title,
                    isUnread: getIsThreadUnread(reports, action.childReportID, action.childVisibleActionCount ?? 0),
                },
            ];
        });
}

export default useConciergeThreads;
export type {ConciergeThread};
