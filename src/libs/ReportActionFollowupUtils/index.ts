import {DomUtils, parseDocument} from 'htmlparser2';
import {getReportActionMessage, isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction} from '@src/types/onyx';

type Followup = {
    text: string;
    response?: string;
};

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

/**
 * Parses followup data from a <followup-list> HTML element.
 * @param html - The HTML string to parse for <followup-list> elements
 * @returns null if no <followup-list> exists, empty array [] if the followup-list has the 'selected' attribute (resolved state), or an array of followup objects if unresolved
 */
function parseFollowupsFromHtml(html: string): Followup[] | null {
    const doc = parseDocument(html);
    const followupListElements = DomUtils.getElementsByTagName('followup-list', doc, true);
    if (followupListElements.length === 0) {
        return null;
    }

    // There will be only one follow up list
    const followupList = followupListElements.at(0);
    if (!followupList) {
        return null;
    }
    if (DomUtils.hasAttrib(followupList, 'selected')) {
        return [];
    }

    const followupElements = DomUtils.getElementsByTagName('followup', followupList, true);
    return followupElements.map((followupEl) => {
        const followupTextElement = DomUtils.getElementsByTagName('followup-text', followupEl, true).at(0);
        const followupResponseElement = DomUtils.getElementsByTagName('followup-response', followupEl, true).at(0);
        const text = followupTextElement ? DomUtils.textContent(followupTextElement) : '';
        const response = followupResponseElement ? DomUtils.textContent(followupResponseElement) : undefined;
        return {text, response};
    });
}
export {containsActionableFollowUps, parseFollowupsFromHtml};
export type {Followup};
