import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {Ancestor} from '@libs/ReportUtils';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias
import {addComment, buildOptimisticResolvedFollowups} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Timezone} from '@src/types/onyx/PersonalDetails';

/**
 * Resolves a suggested followup by posting the selected question as a comment
 * and optimistically updating the HTML to mark the followup-list as resolved.
 * @param report - The report where the action exists
 * @param notifyReportID - The report ID to notify for new actions
 * @param reportAction - The report action containing the followup-list
 * @param selectedFollowup - The followup question selected by the user
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveSuggestedFollowup(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    selectedFollowup: string,
    timezoneParam: Timezone,
    ancestors: Ancestor[] = [],
) {
    const reportID = report?.reportID;
    const reportActionID = reportAction?.reportActionID;

    if (!reportID || !reportActionID) {
        return;
    }

    const resolvedAction = buildOptimisticResolvedFollowups(reportAction);

    if (!resolvedAction) {
        return;
    }

    // Optimistically update the HTML to mark followup-list as resolved
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportActionID]: resolvedAction,
    });

    // Post the selected followup question as a comment
    addComment(report, notifyReportID ?? reportID, ancestors, selectedFollowup, timezoneParam);
}

export default resolveSuggestedFollowup;
