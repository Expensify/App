import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {rand64} from '@libs/NumberUtils';
import type {Followup} from '@libs/ReportActionFollowupUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {buildOptimisticAddCommentReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import {addComment, buildOptimisticResolvedFollowups} from '.';

/** Delay before showing pre-generated Concierge response (in milliseconds) */
const CONCIERGE_RESPONSE_DELAY_MS = 500;

/**
 * Resolves a suggested followup by posting the selected question as a comment
 * and optimistically updating the HTML to mark the followup-list as resolved.
 * If the followup has a pre-generated response, it will show a "Concierge is typing"
 * indicator briefly before displaying the response.
 * @param report - The report where the action exists
 * @param notifyReportID - The report ID to notify for new actions
 * @param reportAction - The report action containing the followup-list
 * @param followup - The followup object containing the question text and optional pre-generated response
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveSuggestedFollowup(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    followup: Followup,
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

    // If there's a pre-generated response, show typing indicator then display response after delay
    if (followup.response) {
        // Generate optimistic Concierge response action ID
        const optimisticConciergeReportActionID = rand64();

        // Post user's comment immediately (API call includes pregenerated params for backend reconciliation)
        addComment(report, notifyReportID ?? reportID, ancestors, followup.text, timezoneParam, false, false, {
            optimisticConciergeReportActionID,
            pregeneratedResponse: followup.response,
        });

        // Show "Concierge is typing..." indicator
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {
            [CONST.ACCOUNT_ID.CONCIERGE]: true,
        });

        // After a brief delay, clear typing indicator and show the Concierge response
        setTimeout(() => {
            // Clear the typing indicator
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {
                [CONST.ACCOUNT_ID.CONCIERGE]: false,
            });

            // Create and add the optimistic Concierge response action
            const optimisticConciergeAction = buildOptimisticAddCommentReportAction(
                followup.response,
                undefined,
                CONST.ACCOUNT_ID.CONCIERGE,
                0,
                reportID,
                optimisticConciergeReportActionID,
            );

            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [optimisticConciergeReportActionID]: optimisticConciergeAction.reportAction,
            } as ReportActions);
        }, CONCIERGE_RESPONSE_DELAY_MS);
    } else {
        // Post the selected followup question as a comment
        addComment(report, notifyReportID ?? reportID, ancestors, followup.text, timezoneParam);
    }
}

export default resolveSuggestedFollowup;
