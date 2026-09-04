import {isActionOfType} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import render from 'dom-serializer';
import {DomUtils, parseDocument} from 'htmlparser2';

type Followup = {
    text: string;
    response?: string;
    source?: string;
};

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

    const source = DomUtils.getAttributeValue(followupList, 'source');
    const followupElements = DomUtils.getElementsByTagName('followup', followupList, true);
    return followupElements.map((followupEl) => {
        const followupTextElement = DomUtils.getElementsByTagName('followup-text', followupEl, true).at(0);
        const followupResponseElement = DomUtils.getElementsByTagName('followup-response', followupEl, true).at(0);
        const text = followupTextElement ? DomUtils.textContent(followupTextElement) : '';
        const response = followupResponseElement ? render(followupResponseElement.children) : undefined;
        return {text, response, source};
    });
}

/**
 * Whether someone other than the agent commented after the given question — i.e. the user started
 * another agent request while this turn was still in flight. Compares identity plus `created`
 * within non-agent comments only: the pregenerated Concierge reply is future-stamped past its
 * display delay, so a message sent during that window sorts before the reply yet is still a
 * newer request.
 */
function hasUserMessageSinceQuestion(actions: OnyxEntry<ReportActions>, questionReportActionID: string | undefined, agentAccountID: number): boolean {
    if (!actions || !questionReportActionID) {
        return false;
    }
    const question = actions[questionReportActionID];
    if (!question) {
        return false;
    }
    return Object.values(actions).some(
        (action) =>
            !!action &&
            action.reportActionID !== questionReportActionID &&
            action.actorAccountID !== agentAccountID &&
            isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) &&
            action.created > question.created,
    );
}

export {hasUserMessageSinceQuestion, parseFollowupsFromHtml};
export type {Followup};
