import CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';
import type {Followup} from './ReportActionsUtils';
import {getReportActionMessage, isActionOfType} from './ReportActionsUtils';

/**
 * Checks if a report action contains actionable (unresolved) followup suggestions.
 * @param reportAction - The report action to check
 * @returns true if the action is an ADD_COMMENT with unresolved followups, false otherwise
 */
function containsActionableFollowUps(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    const isActionAComment = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
    if (!isActionAComment) {
        return false;
    }
    const messageHtml = getReportActionMessage(reportAction)?.html;
    if (!messageHtml) {
        return false;
    }
    const followups = parseFollowupsFromHtml(messageHtml);

    return !!followups && followups.length > 0;
}

// Matches a <followup-list> HTML element and its entire contents. (<followup-list><followup><followup-text>Question?</followup-text></followup></followup-list>)
const followUpListRegex = /<followup-list(\s[^>]*)?>[\s\S]*?<\/followup-list>/i;
/**
 * Parses followup data from a <followup-list> HTML element.
 * @param html - The HTML string to parse for <followup-list> elements
 * @returns null if no <followup-list> exists, empty array [] if the followup-list has the 'selected' attribute (resolved state), or an array of followup objects if unresolved
 */
function parseFollowupsFromHtml(html: string): Followup[] | null {
    const followupListMatch = html.match(followUpListRegex);
    if (!followupListMatch) {
        return null;
    }

    // There will be only one follow up list
    const followupListHtml = followupListMatch[0];
    // Matches a <followup-list> element that has the "selected" attribute (<followup-list selected>...</followup-list>).
    const followUpSelectedListRegex = /<followup-list[^>]*\sselected[\s>]/i;
    const hasSelectedAttribute = followUpSelectedListRegex.test(followupListHtml);
    if (hasSelectedAttribute) {
        return [];
    }

    const followups: Followup[] = [];
    // Matches individual <followup><followup-text>...</followup-text></followup> elements
    const followUpTextRegex = /<followup><followup-text>([^<]*)<\/followup-text><\/followup>/gi;
    let match = followUpTextRegex.exec(followupListHtml);
    while (match !== null) {
        followups.push({text: match[1]});
        match = followUpTextRegex.exec(followupListHtml);
    }
    return followups;
}
export {containsActionableFollowUps, parseFollowupsFromHtml};
