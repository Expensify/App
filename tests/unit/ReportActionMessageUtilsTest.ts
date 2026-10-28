import {getOriginalMessage, getReportActionHtml, getReportActionMessage, getReportActionText, getTextFromHtml} from '@libs/ReportActionMessageUtils';

import CONST from '@src/CONST';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {Message} from '@src/types/onyx/ReportAction';

type LegacyFields = {
    message?: unknown;
    originalMessage?: unknown;
};

// OldDot payloads put values in `message` and `originalMessage` that the ReportAction type no longer declares.
function withLegacyFields(action: ReportAction, fields: LegacyFields): ReportAction {
    Object.assign(action, fields);
    return action;
}

function buildMessageEntry(html: string, text = html): Message {
    return {html, text, type: CONST.REPORT.MESSAGE.TYPE.COMMENT, whisperedTo: []};
}

function buildCommentAction(message?: ReportAction['message']): ReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: '1',
        created: '2026-01-01 00:00:00.000',
        message,
    };
}

describe('getReportActionMessage', () => {
    it('returns the first entry when message is an array', () => {
        const first = buildMessageEntry('first');
        const second = buildMessageEntry('second');

        expect(getReportActionMessage(buildCommentAction([first, second]))).toBe(first);
    });

    it('returns the message itself when it is not an array', () => {
        const message = {html: 'single', text: 'single'};

        expect(getReportActionMessage(withLegacyFields(buildCommentAction(), {message}))).toBe(message);
    });

    it('returns undefined when there is no message', () => {
        expect(getReportActionMessage(buildCommentAction())).toBeUndefined();
        expect(getReportActionMessage(undefined)).toBeUndefined();
    });
});

describe('getOriginalMessage', () => {
    it('returns the object when originalMessage is object-shaped', () => {
        const action = withLegacyFields(buildCommentAction(), {originalMessage: {html: 'hi', whisperedTo: []}});

        expect(getOriginalMessage(action)).toEqual({html: 'hi', whisperedTo: []});
    });

    it('returns undefined when the underlying originalMessage is a plain string (legacy shape)', () => {
        const action = withLegacyFields(buildCommentAction(), {originalMessage: 'plain string from legacy backend'});

        expect(getOriginalMessage(action)).toBeUndefined();
    });

    it('returns undefined when message is a non-array string and originalMessage is missing', () => {
        const action = withLegacyFields(buildCommentAction(), {message: 'plain string from legacy backend'});

        expect(getOriginalMessage(action)).toBeUndefined();
    });

    it('prefers a non-array message over originalMessage', () => {
        const action = withLegacyFields(buildCommentAction(), {message: {html: 'from message'}, originalMessage: {html: 'from originalMessage'}});

        expect(getOriginalMessage(action)).toEqual({html: 'from message'});
    });

    it('falls back to originalMessage when message is an array', () => {
        const action = withLegacyFields(buildCommentAction([buildMessageEntry('in array')]), {originalMessage: {html: 'from originalMessage'}});

        expect(getOriginalMessage(action)).toEqual({html: 'from originalMessage'});
    });

    it('returns undefined when message is null', () => {
        expect(getOriginalMessage(withLegacyFields(buildCommentAction(), {message: null}))).toBeUndefined();
    });

    it('returns undefined for an undefined action', () => {
        expect(getOriginalMessage(undefined)).toBeUndefined();
    });
});

describe('getReportActionHtml', () => {
    it('returns the html of the first message entry', () => {
        expect(getReportActionHtml(buildCommentAction([buildMessageEntry('<b>Hello</b>', 'Hello')]))).toBe('<b>Hello</b>');
    });

    it('returns an empty string when there is no html', () => {
        expect(getReportActionHtml(buildCommentAction())).toBe('');
        expect(getReportActionHtml(undefined)).toBe('');
    });
});

describe('getReportActionText', () => {
    it('returns the backend-provided CARDFROZEN text', () => {
        const cardFrozenMessage = 'A A froze their Expensify Card (ending in 1384). New transactions will be declined until the card is unfrozen.';
        const action: ReportAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN,
            reportActionID: 'card-frozen-action-123',
            actorAccountID: 21052128,
            created: '2026-03-12 01:58:43.479',
            message: [buildMessageEntry(cardFrozenMessage)],
        };

        expect(getReportActionText(action)).toBe(cardFrozenMessage);
    });

    it('returns the backend-provided CARDUNFROZEN text', () => {
        const cardUnfrozenMessage = 'A A unfroze their Expensify Card (ending in 1384). This card can now be used for transactions.';
        const action: ReportAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN,
            reportActionID: 'card-unfrozen-action-123',
            actorAccountID: 21052128,
            created: '2026-03-12 02:08:08.128',
            message: [buildMessageEntry(cardUnfrozenMessage)],
        };

        expect(getReportActionText(action)).toBe(cardUnfrozenMessage);
    });

    it('falls back to the message text when html is an empty string', () => {
        expect(getReportActionText(buildCommentAction([{...buildMessageEntry('ignored'), html: '', text: 'Fallback text'}]))).toBe('Fallback text');
    });

    it('drops the followup list from the html', () => {
        const html = '<followup-list><followup><followup-text>Which one?</followup-text></followup></followup-list>Please review';

        expect(getReportActionText(buildCommentAction([buildMessageEntry(html)]))).toBe('Please review');
    });

    it('returns an empty string when there is no message', () => {
        expect(getReportActionText(buildCommentAction())).toBe('');
        expect(getReportActionText(undefined)).toBe('');
    });
});

describe('getTextFromHtml', () => {
    it('converts html to text', () => {
        expect(getTextFromHtml('Hello world')).toBe('Hello world');
    });

    it('returns an empty string for empty or missing html', () => {
        expect(getTextFromHtml('')).toBe('');
        expect(getTextFromHtml()).toBe('');
    });
});
