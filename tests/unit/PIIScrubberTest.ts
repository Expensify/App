// Sentry's event/log shapes use snake_case fields (query_string, span_id, trace_id, ...)
/* eslint-disable @typescript-eslint/naming-convention */
import type {ErrorEvent, EventHint, Log, TransactionEvent} from '@sentry/core';
import piiErrorScrubber from '@libs/telemetry/middlewares/piiErrorScrubber';
import piiLogScrubber from '@libs/telemetry/middlewares/piiLogScrubber';
import piiTransactionScrubber from '@libs/telemetry/middlewares/piiTransactionScrubber';
import scrubPII from '@libs/telemetry/scrubPII';

const hint = {} as EventHint;

describe('scrubPII', () => {
    it('redacts a plain email address', () => {
        expect(scrubPII('contact foo@bar.com now')).toBe('contact [login] now');
    });

    it('redacts a percent-encoded email embedded in a URL path', () => {
        expect(scrubPII('settings/security/delegate/foo%40bar.com/role/member')).toBe('settings/security/delegate/[login]/role/member');
    });

    it('redacts a phone login (SMS domain), both decoded and encoded', () => {
        expect(scrubPII('+15551234567@expensify.sms')).toBe('[login]');
        expect(scrubPII('settings/security/merge-accounts/%2B15551234567%40expensify.sms/magic-code')).toBe('settings/security/merge-accounts/[login]/magic-code');
    });

    it('redacts login/email query parameters even when not email-shaped', () => {
        expect(scrubPII('a/123?login=someValue')).toBe('a/123?login=[login]');
        expect(scrubPII('workspaces/abc/join?email=foo%40bar.com')).toBe('workspaces/abc/join?email=[login]');
    });

    it('does not cross path segment or query boundaries', () => {
        expect(scrubPII('a/foo@bar.com/role/admin?policyID=123')).toBe('a/[login]/role/admin?policyID=123');
    });

    it('leaves strings without PII untouched', () => {
        expect(scrubPII('settings/security/delegate')).toBe('settings/security/delegate');
        expect(scrubPII('Navigation to Profile_Root')).toBe('Navigation to Profile_Root');
    });
});

describe('piiTransactionScrubber middleware', () => {
    it('scrubs the transaction name', () => {
        const event = {type: 'transaction', transaction: '/settings/security/delegate/foo%40bar.com/role/member'} as TransactionEvent;
        piiTransactionScrubber(event, hint);
        expect(event.transaction).toBe('/settings/security/delegate/[login]/role/member');
    });

    it('scrubs the request URL and query string', () => {
        const event = {
            type: 'transaction',
            request: {url: 'https://new.expensify.com/a/123?login=foo@bar.com', query_string: 'login=foo@bar.com'},
        } as TransactionEvent;
        piiTransactionScrubber(event, hint);
        expect(event.request?.url).toBe('https://new.expensify.com/a/123?login=[login]');
        expect(event.request?.query_string).toBe('login=[login]');
    });

    it('scrubs string values in trace context data', () => {
        const event = {
            type: 'transaction',
            contexts: {trace: {span_id: 'x', trace_id: 'y', data: {url: 'a/foo@bar.com', 'route.name': 'Profile_Root'}}},
        } as TransactionEvent;
        piiTransactionScrubber(event, hint);
        expect(event.contexts?.trace?.data?.url).toBe('a/[login]');
        expect(event.contexts?.trace?.data?.['route.name']).toBe('Profile_Root');
    });

    it('scrubs breadcrumb messages and data', () => {
        const event = {
            type: 'transaction',
            breadcrumbs: [{message: 'Navigation to a/foo@bar.com', data: {to: 'a/foo@bar.com', from: 'home'}}],
        } as TransactionEvent;
        piiTransactionScrubber(event, hint);
        expect(event.breadcrumbs?.at(0)?.message).toBe('Navigation to a/[login]');
        expect(event.breadcrumbs?.at(0)?.data?.to).toBe('a/[login]');
        expect(event.breadcrumbs?.at(0)?.data?.from).toBe('home');
    });

    it('returns the event untouched when there is no PII', () => {
        const event = {type: 'transaction', transaction: 'Profile_Root'} as TransactionEvent;
        expect(piiTransactionScrubber(event, hint)).toBe(event);
    });
});

describe('piiErrorScrubber middleware (error events)', () => {
    it('scrubs the exception message', () => {
        const event = {
            type: undefined,
            exception: {values: [{type: 'Error', value: 'Request to a/123?login=foo@bar.com failed'}]},
        } as ErrorEvent;
        piiErrorScrubber(event, hint);
        expect(event.exception?.values?.at(0)?.value).toBe('Request to a/123?login=[login] failed');
    });

    it('scrubs the transaction name, request URL and breadcrumbs carried by an error event', () => {
        const event = {
            type: undefined,
            transaction: '/settings/security/delegate/foo%40bar.com/role/member',
            message: 'login foo@bar.com errored',
            request: {url: 'https://new.expensify.com/a/123?login=foo@bar.com'},
            breadcrumbs: [{message: 'Navigation to a/foo@bar.com', data: {to: 'a/foo@bar.com'}}],
        } as ErrorEvent;
        piiErrorScrubber(event, hint);
        expect(event.transaction).toBe('/settings/security/delegate/[login]/role/member');
        expect(event.message).toBe('login [login] errored');
        expect(event.request?.url).toBe('https://new.expensify.com/a/123?login=[login]');
        expect(event.breadcrumbs?.at(0)?.message).toBe('Navigation to a/[login]');
        expect(event.breadcrumbs?.at(0)?.data?.to).toBe('a/[login]');
    });

    it('returns the error event untouched when there is no PII', () => {
        const event = {type: undefined, exception: {values: [{type: 'Error', value: 'Something went wrong'}]}} as ErrorEvent;
        expect(piiErrorScrubber(event, hint)).toBe(event);
    });
});

describe('piiLogScrubber middleware (logs)', () => {
    it('scrubs the log message', () => {
        const log = {level: 'info', message: '[Reauthenticate] failed for foo@bar.com'} as Log;
        piiLogScrubber(log);
        expect(log.message).toBe('[Reauthenticate] failed for [login]');
    });

    it('scrubs string attributes', () => {
        const log = {level: 'error', message: 'request failed', attributes: {url: 'a/123?login=foo@bar.com', command: 'OpenApp'}} as Log;
        piiLogScrubber(log);
        expect(log.attributes?.url).toBe('a/123?login=[login]');
        expect(log.attributes?.command).toBe('OpenApp');
    });

    it('returns the log untouched when there is no PII', () => {
        const log = {level: 'info', message: '[MFA] code sent'} as Log;
        expect(piiLogScrubber(log)).toBe(log);
    });
});
