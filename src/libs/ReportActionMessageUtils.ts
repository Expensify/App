/**
 * Readers for a report action's message: pull the message entry, its html/text, and the normalized original message.
 */
import type {OnyxInputOrEntry} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import type {PartialReportAction} from './ReportUtils';

import Parser from './Parser';
import stripFollowupListFromHtml from './ReportActionFollowupUtils/stripFollowupListFromHtml';

function getReportActionMessage(reportAction: PartialReportAction) {
    return Array.isArray(reportAction?.message) ? reportAction?.message.at(0) : reportAction?.message;
}

function getOriginalMessage<T extends ReportActionName>(reportAction: OnyxInputOrEntry<ReportAction<T>>): OriginalMessage<T> | undefined {
    // Reading the deprecated message/originalMessage fields is intentional because OldDot actions still populate them
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const candidate = !Array.isArray(reportAction?.message) ? (reportAction?.message ?? reportAction?.originalMessage) : reportAction?.originalMessage;

    // Some legacy/OldDot report actions (e.g. card-imported expense updates) store a plain notification
    // string in `message`/`originalMessage` instead of the object shape declared by `OriginalMessage<T>`.
    // Downstream callers use the JS `in` operator on the result, which throws a TypeError on non-objects.
    // Normalize non-object values to undefined so the runtime matches the declared TypeScript contract.
    if (candidate === null || typeof candidate !== 'object') {
        return undefined;
    }
    return candidate as OriginalMessage<T>;
}

function getReportActionHtml(reportAction: PartialReportAction): string {
    return getReportActionMessage(reportAction)?.html ?? '';
}

function getReportActionText(reportAction: PartialReportAction): string {
    const message = getReportActionMessage(reportAction);
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const text = stripFollowupListFromHtml(message?.html) || (message?.text ?? '');
    return text ? Parser.htmlToText(text) : '';
}

function getTextFromHtml(html?: string): string {
    return html ? Parser.htmlToText(html) : '';
}

export {getOriginalMessage, getReportActionHtml, getReportActionMessage, getReportActionText, getTextFromHtml};
