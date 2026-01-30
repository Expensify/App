import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {rand64} from '@libs/NumberUtils';
import type {Followup} from '@libs/ReportActionFollowupUtils';
import type {Ancestor, OptimisticReportAction} from '@libs/ReportUtils';
import {buildOptimisticAddCommentReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Timezone} from '@src/types/onyx/PersonalDetails';
import {addComment, buildOptimisticResolvedFollowups} from '.';

/** Delay before showing pre-generated Concierge response (in milliseconds) */
const CONCIERGE_RESPONSE_DELAY_MS = 1500;

/**
 * Resolves a suggested followup by posting the selected question as a comment
 * and optimistically updating the HTML to mark the followup-list as resolved.
 * If the followup has a pre-generated response, it will show a "Concierge is typing"
 * indicator briefly before displaying the response.
 * @param report - The report where the action exists
 * @param notifyReportID - The report ID to notify for new actions
 * @param reportAction - The report action containing the followup-list
 * @param selectedFollowup - The followup object containing the question text and optional pre-generated response
 * @param timezoneParam - The user's timezone
 * @param ancestors - Array of ancestor reports for proper threading
 */
function resolveSuggestedFollowup(
    report: OnyxEntry<Report>,
    notifyReportID: string | undefined,
    reportAction: OnyxEntry<ReportAction>,
    selectedFollowup: Followup,
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

    if (!selectedFollowup.response) {
        addComment(report, notifyReportID ?? reportID, ancestors, selectedFollowup.text, timezoneParam);
        return;
    }

    // If there's a pre-generated response, show typing indicator then display response after delay

    const optimisticConciergeReportActionID = rand64();

    // Post user's comment immediately
    addComment(report, notifyReportID ?? reportID, ancestors, selectedFollowup.text, timezoneParam, false, false, {
        optimisticConciergeReportActionID,
        pregeneratedResponse: selectedFollowup.response,
    });

    const optimisticConciergeAction = buildOptimisticAddCommentReportAction(
        selectedFollowup.response,
        undefined,
        CONST.ACCOUNT_ID.CONCIERGE,
        CONCIERGE_RESPONSE_DELAY_MS,
        reportID,
        optimisticConciergeReportActionID,
    );

    addOptimisticConciergeActionWithDelay(reportID, optimisticConciergeAction);
}

function addOptimisticConciergeActionWithDelay(reportID: string, optimisticConciergeAction: OptimisticReportAction) {
    // Show "Concierge is typing..." indicator
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {
        [CONST.ACCOUNT_ID.CONCIERGE]: true,
    });

    setTimeout(() => {
        // Clear the typing indicator
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {
            [CONST.ACCOUNT_ID.CONCIERGE]: false,
        });

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [optimisticConciergeAction.reportAction.reportActionID]: optimisticConciergeAction.reportAction,
        });
    }, CONCIERGE_RESPONSE_DELAY_MS);
}

export {resolveSuggestedFollowup, CONCIERGE_RESPONSE_DELAY_MS};
