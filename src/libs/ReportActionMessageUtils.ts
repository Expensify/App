/**
 * Readers for the message payload carried by a report action.
 *
 * They live outside `ReportActionsUtils` because that module imports `ReportUtils` and the action layer, so callers
 * that only need to read an action's message would otherwise pull the whole graph in and close an import cycle.
 */
import type {OnyxInputOrEntry} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OriginalMessage} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import Parser from './Parser';
import stripFollowupListFromHtml from './ReportActionFollowupUtils/stripFollowupListFromHtml';
import type {PartialReportAction} from './ReportUtils';

function getReportActionMessage(reportAction: PartialReportAction) {
    return Array.isArray(reportAction?.message) ? reportAction?.message.at(0) : reportAction?.message;
}

function getOriginalMessage<T extends ReportActionName>(reportAction: OnyxInputOrEntry<ReportAction<T>>): OriginalMessage<T> | undefined {
    // This is the accessor that replaces direct `originalMessage` reads, so it has to touch the deprecated field itself.
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
