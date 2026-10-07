/**
 * These tests verify that only a name the delegate actually set survives as-is, and that every value the backend
 * derives from the login is localized instead of being shown as a raw E.164 number.
 */
import getVacationDelegateDisplayName from '@libs/getVacationDelegateDisplayName';

const NEPAL_LOGIN = '+9779806050938@expensify.sms';
const NEPAL_RAW = '+9779806050938';
const NEPAL_LOCAL = '980-6050938';

const INDIA_LOGIN = '+919789942470@expensify.sms';
const INDIA_RAW = '+919789942470';
const INDIA_LOCAL = '97899 42470';

const EMAIL_LOGIN = 'jane@example.com';

/** Stands in for the localized helper: strips the SMS domain and renders known numbers the way the viewer's region does. */
function formatPhoneNumber(value: string): string {
    if (!value) {
        return '';
    }
    const withoutSMSDomain = value.replace('@expensify.sms', '');
    if (withoutSMSDomain === NEPAL_RAW) {
        return NEPAL_LOCAL;
    }
    if (withoutSMSDomain === INDIA_RAW) {
        return INDIA_LOCAL;
    }
    return withoutSMSDomain;
}

describe('getVacationDelegateDisplayName', () => {
    it('localizes the login when there is no display name at all, as happens after a cache clear', () => {
        expect(getVacationDelegateDisplayName(NEPAL_LOGIN, undefined, formatPhoneNumber)).toBe(NEPAL_LOCAL);
    });

    it('localizes a display name the backend defaulted to the full SMS login', () => {
        expect(getVacationDelegateDisplayName(NEPAL_LOGIN, NEPAL_LOGIN, formatPhoneNumber)).toBe(NEPAL_LOCAL);
    });

    // Bug #89578 — the reported case: a local number was shown with its country code because the backend hands back
    // the login as the display name with the SMS domain already stripped.
    it('localizes a display name the backend defaulted to the login without its SMS domain', () => {
        expect(getVacationDelegateDisplayName(NEPAL_LOGIN, NEPAL_RAW, formatPhoneNumber)).toBe(NEPAL_LOCAL);
        expect(getVacationDelegateDisplayName(NEPAL_LOGIN, NEPAL_RAW, formatPhoneNumber)).not.toBe(NEPAL_RAW);
    });

    it('localizes a display name holding the same number in another shape', () => {
        expect(getVacationDelegateDisplayName(INDIA_LOGIN, '+91 97899 42470', formatPhoneNumber)).toBe(INDIA_LOCAL);
    });

    // A local contact is stored as `9806050938` while personal details come back as E.164. The title used to
    // keep the country code because the two strings did not match after stripping the SMS domain.
    it('localizes an E.164 display name even when the login is still the national form', () => {
        expect(getVacationDelegateDisplayName('9806050938@expensify.sms', NEPAL_RAW, formatPhoneNumber)).toBe(NEPAL_LOCAL);
        expect(getVacationDelegateDisplayName('9806050938@expensify.sms', NEPAL_RAW, formatPhoneNumber)).not.toBe(NEPAL_RAW);
    });

    it('keeps a name the delegate set on a phone-number account', () => {
        expect(getVacationDelegateDisplayName(NEPAL_LOGIN, 'Jane Doe', formatPhoneNumber)).toBe('Jane Doe');
    });

    it('keeps a name the delegate set on an email account, and leaves a defaulted one as the email', () => {
        expect(getVacationDelegateDisplayName(EMAIL_LOGIN, 'Jane Doe', formatPhoneNumber)).toBe('Jane Doe');
        expect(getVacationDelegateDisplayName(EMAIL_LOGIN, EMAIL_LOGIN, formatPhoneNumber)).toBe(EMAIL_LOGIN);
    });
});
