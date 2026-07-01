// Replaces a redacted login in scrubbed strings.
const PII_PLACEHOLDER = '[login]';

/** Email/phone login, decoded (`foo@bar.com`) or percent-encoded (`foo%40bar.com`). Excludes `/?&=#` so it never crosses a path/query boundary. */
const LOGIN_REGEX = /[\w.%+-]+(?:@|%40)[\w.%+-]+\.\w{2,}/gi;

/** Value of a known PII query param (`?login=`, `&email=`); safety net for values that are not email-shaped. */
const PII_QUERY_PARAM_REGEX = /([?&](?:login|email)=)[^\s&#/]*/gi;

/**
 * Replaces user logins found in a string with a placeholder, returning it unchanged when none are present.
 *
 * Removes emails and phone logins (e.g. `+1...@expensify.sms`) before they reach Sentry,
 * since several routes embed a login in the URL path/query. Logins from URLs are often
 * percent-encoded, so matching handles both `@` and `%40`.
 */
function scrubPII(value: string): string {
    return value.replaceAll(PII_QUERY_PARAM_REGEX, `$1${PII_PLACEHOLDER}`).replaceAll(LOGIN_REGEX, PII_PLACEHOLDER);
}

export default scrubPII;
export {PII_PLACEHOLDER};
