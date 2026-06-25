import type {EventHint, TransactionEvent} from '@sentry/core';
import {getCurrentUserEmail} from '@libs/CurrentUserStore';
import emailDomainFilter from '@libs/telemetry/middlewares/emailDomainFilter';
import CONST from '@src/CONST';

jest.mock('@libs/CurrentUserStore', () => ({
    getCurrentUserEmail: jest.fn(),
}));

const mockedGetCurrentUserEmail = jest.mocked(getCurrentUserEmail);

/**
 * Builds a minimal TransactionEvent. The filter only inspects the current user's email,
 * never the event payload, so the event content itself is irrelevant.
 */
function createEvent(): TransactionEvent {
    return {type: 'transaction', transaction: 'SomeSpan'} as TransactionEvent;
}

const hint = {} as EventHint;

describe('emailDomainFilter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('drops the event when the current user is a QA account (CONST.EMAIL.QA_DOMAIN)', () => {
        mockedGetCurrentUserEmail.mockReturnValue(`SomeUser@${CONST.EMAIL.QA_DOMAIN}`);
        expect(emailDomainFilter(createEvent(), hint)).toBeNull();
    });

    it('drops the event when the current user is on the applauseauto.com domain', () => {
        mockedGetCurrentUserEmail.mockReturnValue('someuser@applauseauto.com');
        expect(emailDomainFilter(createEvent(), hint)).toBeNull();
    });

    it('drops the event regardless of email casing', () => {
        mockedGetCurrentUserEmail.mockReturnValue(`SomeUser@${CONST.EMAIL.QA_DOMAIN.toUpperCase()}`);
        expect(emailDomainFilter(createEvent(), hint)).toBeNull();
    });

    it('keeps the event for the allow-listed applause tester account even though it is on the QA domain', () => {
        mockedGetCurrentUserEmail.mockReturnValue('applausetester@applause.expensifail.com');
        const event = createEvent();
        expect(emailDomainFilter(event, hint)).toBe(event);
    });

    it('keeps the event for the allow-listed applause tester account regardless of casing', () => {
        mockedGetCurrentUserEmail.mockReturnValue('APPLAUSETESTER@APPLAUSE.EXPENSIFAIL.COM');
        const event = createEvent();
        expect(emailDomainFilter(event, hint)).toBe(event);
    });

    it('keeps the event for a regular (non-QA) user', () => {
        mockedGetCurrentUserEmail.mockReturnValue('realuser@expensify.com');
        const event = createEvent();
        expect(emailDomainFilter(event, hint)).toBe(event);
    });

    it('keeps the event when there is no current user email (e.g. before the session has hydrated)', () => {
        mockedGetCurrentUserEmail.mockReturnValue(null);
        const event = createEvent();
        expect(emailDomainFilter(event, hint)).toBe(event);
    });
});
