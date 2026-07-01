/* eslint-disable no-param-reassign */
import type {Event} from '@sentry/core';
import scrubPII from './scrubPII';

/** Replaces PII in every string value of a key/value bag, in place. */
function scrubStringValues(data: Record<string, unknown>): void {
    for (const key of Object.keys(data)) {
        const value = data[key];
        if (typeof value === 'string') {
            data[key] = scrubPII(value);
        }
    }
}

/**
 * Removes user logins from a Sentry event in place. Shared by the transaction and error paths since
 * every field touched lives on the `Event` base type. Span descriptions are left untouched.
 */
function scrubEventPII(event: Event): void {
    if (typeof event.transaction === 'string') {
        event.transaction = scrubPII(event.transaction);
    }

    if (typeof event.message === 'string') {
        event.message = scrubPII(event.message);
    }

    if (typeof event.request?.url === 'string') {
        event.request.url = scrubPII(event.request.url);
    }

    if (typeof event.request?.query_string === 'string') {
        event.request.query_string = scrubPII(event.request.query_string);
    }

    if (event.contexts?.trace?.data) {
        scrubStringValues(event.contexts.trace.data);
    }

    for (const breadcrumb of event.breadcrumbs ?? []) {
        if (typeof breadcrumb.message === 'string') {
            breadcrumb.message = scrubPII(breadcrumb.message);
        }
        if (breadcrumb.data) {
            scrubStringValues(breadcrumb.data);
        }
    }

    // Scrub the exception message but not stack frames (not PII).
    for (const exception of event.exception?.values ?? []) {
        if (typeof exception.value !== 'string') {
            continue;
        }
        exception.value = scrubPII(exception.value);
    }
}

export default scrubEventPII;
