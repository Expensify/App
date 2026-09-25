/**
 * These tests verify that the menu item correctly renders:
 *  - existing accounts (personal details present) for both email and phone-number logins
 *  - new accounts (personal details missing, e.g. after cache clear) for both email and phone-number logins
 */
import {render, screen} from '@testing-library/react-native';

import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';

import useVacationDelegatePersonalDetails from '@hooks/useVacationDelegatePersonalDetails';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import React from 'react';

// The component reads `formatPhoneNumber` from `useLocalize`. The real one depends on the Onyx country code
// (not initialized here), so provide a deterministic stub that mirrors the behavior the fix relies on: strip
// the SMS domain, render a phone number in the viewer's local format, and leave non-phone strings (e.g.
// emails) untouched. The local format has to differ from the raw E.164 login, otherwise a title that skipped
// formatting would be indistinguishable from one that went through it.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (value: string) => {
            if (!value) {
                return '';
            }
            const withoutSMSDomain = value.replace('@expensify.sms', '');
            return withoutSMSDomain === '+919789942470' ? '97899 42470' : withoutSMSDomain;
        },
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'fallback-avatar'})),
}));

jest.mock('@hooks/useVacationDelegatePersonalDetails', () => jest.fn(() => undefined));

// Capture the props passed to the MenuItemAvatar so the test can assert against `avatarID` directly
// (rather than re-encoding through `toJSON()`).
const capturedAvatarProps: Array<Record<string, unknown>> = [];

jest.mock('@components/Avatar/UserAvatar', () => {
    function MockUserAvatar(props: Record<string, unknown>) {
        capturedAvatarProps.push(props);
        return null;
    }
    return MockUserAvatar;
});

const mockUseVacationDelegatePersonalDetails = jest.mocked(useVacationDelegatePersonalDetails);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';
const PHONE_DELEGATE_LOCALIZED = '97899 42470';

function lastAvatarProps() {
    return capturedAvatarProps.at(-1) ?? {};
}

describe('VacationDelegateMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedAvatarProps.length = 0;
        mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);
    });

    function renderMenuItem(delegate?: string, pendingAction?: PendingAction) {
        render(
            <VacationDelegateMenuItem
                vacationDelegate={delegate ? {delegate} : undefined}
                pendingAction={pendingAction}
                onCloseError={jest.fn()}
                onPress={jest.fn()}
            />,
        );
    }

    function textOccurrences(text: string) {
        return screen.queryAllByText(text).length;
    }

    describe('existing account (personal details available)', () => {
        it('renders the displayName for an email delegate without `@expensify.sms` artifacts', () => {
            // Given an existing account with personal details already loaded: an email login and a real display name
            const personalDetails: PersonalDetails = {
                accountID: 42,
                login: EMAIL_DELEGATE,
                displayName: 'Jane Doe',
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            // When the menu item renders that delegate
            renderMenuItem(EMAIL_DELEGATE);

            // Then the name, email, and avatar all show as-is, since an email login has no SMS artifacts to strip
            expect(screen.getByText('Jane Doe')).toBeTruthy();
            expect(screen.getByText(EMAIL_DELEGATE)).toBeTruthy();
            expect(lastAvatarProps().accountID).toBe(42);
            expect(screen.queryByText(/@expensify\.sms/)).toBeNull();
        });

        it('renders the localized phone number for a phone-number account that has no name of its own', () => {
            // Given a phone-number account whose displayName the backend defaulted to the raw login (its SMS
            // domain still attached), because it has no name of its own
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_WITH_SMS_DOMAIN,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            // When the menu item renders that delegate
            renderMenuItem(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            // Then the title is formatted into the localized number rather than shown as the raw E.164 login it is
            expect(textOccurrences(PHONE_DELEGATE_LOCALIZED)).toBe(2);
            expect(screen.queryByText(PHONE_DELEGATE_RAW)).toBeNull();
            expect(lastAvatarProps().accountID).toBe(43);
            expect(screen.queryByText(/@expensify\.sms/)).toBeNull();
        });

        it('localizes a display name that is the login without its SMS domain', () => {
            // Given Bug #89578's reported case: Auth hands back the login as the display name but with the SMS
            // domain already stripped off
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_RAW,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            // When the menu item renders that delegate
            renderMenuItem(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            // Then the title is still localized instead of reaching the screen as a raw E.164 number, which is
            // what used to happen because stripping the domain alone isn't the same as detecting a phone number
            expect(textOccurrences(PHONE_DELEGATE_LOCALIZED)).toBe(2);
            expect(screen.queryByText(PHONE_DELEGATE_RAW)).toBeNull();
        });

        it('keeps the name a phone-number account did set, and localizes the number below it', () => {
            // Given a phone-number account that did set a real display name of its own
            const personalDetails: PersonalDetails = {
                accountID: 44,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: 'Jane Doe',
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            // When the menu item renders that delegate
            renderMenuItem(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            // Then the real name is left untouched and only the number below it is localized, so formatting logic
            // built for the no-name case doesn't clobber a name the account actually has
            expect(screen.getByText('Jane Doe')).toBeTruthy();
            expect(textOccurrences(PHONE_DELEGATE_LOCALIZED)).toBe(1);
            expect(screen.queryByText(PHONE_DELEGATE_RAW)).toBeNull();
        });

        it('localizes an E.164 display name when the login is still the national form', () => {
            // Given a local contact stored without its country code, whose personal details came back as E.164 —
            // which used to become the title verbatim, showing `+91…` above a localized number underneath it
            const personalDetails: PersonalDetails = {
                accountID: 45,
                login: '9789942470@expensify.sms',
                displayName: PHONE_DELEGATE_RAW,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            // When the menu item renders that delegate
            renderMenuItem('9789942470@expensify.sms');

            // Then the title is localized rather than left as the raw E.164 display name, and the login below it
            // still shows in its stored national form
            expect(screen.getByText(PHONE_DELEGATE_LOCALIZED)).toBeTruthy();
            expect(screen.getByText('9789942470')).toBeTruthy();
            expect(screen.queryByText(PHONE_DELEGATE_RAW)).toBeNull();
        });
    });

    describe('new account (personal details missing, e.g. after cache clear)', () => {
        it('renders the raw email as title and description when no personal details exist', () => {
            // Given a new account with no personal details loaded yet (e.g. right after a cache clear), for an
            // email delegate
            mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);

            // When the menu item renders that delegate
            renderMenuItem(EMAIL_DELEGATE);

            // Then the raw email is used for both title and description, since there is no name to fall back on
            // and an email login has nothing to format
            expect(textOccurrences(EMAIL_DELEGATE)).toBe(2);
            expect(screen.queryByText(/@expensify\.sms/)).toBeNull();
        });

        it('renders the localized phone number when no personal details exist', () => {
            // Given Bug #89578's exact reported scenario: no personal details loaded at all, for a phone-number
            // delegate
            mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);

            // When the menu item renders that delegate
            renderMenuItem(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            // Then the number is still localized from the login alone, rather than showing the raw E.164 login
            // or leaking its SMS domain
            expect(textOccurrences(PHONE_DELEGATE_LOCALIZED)).toBe(2);
            expect(screen.queryByText(PHONE_DELEGATE_RAW)).toBeNull();
            expect(screen.queryByText(/@expensify\.sms/)).toBeNull();
        });
    });

    it('renders the empty-state menu item when no vacation delegate is set', () => {
        // Given no vacation delegate has ever been set
        // When the menu item renders
        renderMenuItem();

        // Then the empty-state label shows and no avatar is rendered, since there is no delegate to show one for
        expect(screen.getByText('common.vacationDelegate')).toBeTruthy();
        expect(capturedAvatarProps).toHaveLength(0);
    });

    it('shows the empty state immediately while the delegate removal is in flight', () => {
        // Given a delegate removal that is still in flight: OfflineWithFeedback hides a row pending deletion, which
        // used to blank the whole field for the length of the request, and removing the delegate empties this
        // field rather than removing the row
        // When the menu item renders with no delegate and a DELETE pendingAction
        renderMenuItem(undefined, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

        // Then the empty state shows at once instead of a blank field for the duration of the request
        expect(screen.getByText('common.vacationDelegate')).toBeTruthy();
    });
});
