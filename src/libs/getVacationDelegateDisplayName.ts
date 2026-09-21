import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {Str} from 'expensify-common';

import {parsePhoneNumber} from './PhoneNumber';

/**
 * Returns the name to show for a vacation delegate: the name the delegate set, or their login localized for the
 * viewer.
 *
 * A delegate that never set a name has no name of its own to show. The backend still fills `displayName` in — with
 * the login, sometimes carrying the `@expensify.sms` domain and sometimes not — and a cache clear leaves no personal
 * details at all. A local contact can also come back as E.164 (`+9779806050938`) while the login is still the
 * national form, which used to reach the title as a country-coded number above a localized subtitle. Anything that
 * is a phone number goes through `formatPhoneNumber` instead.
 */
function getVacationDelegateDisplayName(login: string, displayName: string | undefined, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']): string {
    const formattedLogin = formatPhoneNumber(login);
    if (!displayName) {
        return formattedLogin;
    }

    const sanitizedLogin = Str.removeSMSDomain(login);
    const sanitizedDisplayName = Str.removeSMSDomain(displayName);
    if (sanitizedDisplayName === sanitizedLogin) {
        return formattedLogin;
    }

    // A number is not a name — including when a local contact's displayName is E.164 and the login is not.
    if (parsePhoneNumber(sanitizedDisplayName).valid) {
        const formattedDisplayName = formatPhoneNumber(sanitizedDisplayName);
        // Spaced/hyphenated numbers fail formatPhoneNumber's digit check and come back unchanged; the login is
        // always a bare E.164 or SMS login, so it formats reliably.
        return formattedDisplayName && formattedDisplayName !== sanitizedDisplayName ? formattedDisplayName : formattedLogin;
    }

    return sanitizedDisplayName;
}

export default getVacationDelegateDisplayName;
