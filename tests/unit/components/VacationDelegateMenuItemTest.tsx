/**
 * These tests verify that the menu item correctly renders:
 *  - existing accounts (personal details present) for both email and phone-number logins
 *  - new accounts (personal details missing, e.g. after cache clear) for both email and phone-number logins
 */
import {render} from '@testing-library/react-native';

import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';

import useVacationDelegatePersonalDetails from '@hooks/useVacationDelegatePersonalDetails';

import type {PersonalDetails} from '@src/types/onyx';

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

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockOfflineWithFeedback;
});

// Capture the props passed to the MenuItem so the test can assert against `title`, `description`,
// and `avatarID` directly (rather than re-encoding through `toJSON()`).
const capturedMenuItemProps: Array<Record<string, unknown>> = [];

jest.mock('@components/MenuItem', () => {
    function MockMenuItem(props: Record<string, unknown>) {
        capturedMenuItemProps.push(props);
        return null;
    }
    return MockMenuItem;
});

jest.mock('@components/Text', () => {
    function MockText({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockText;
});

const mockUseVacationDelegatePersonalDetails = jest.mocked(useVacationDelegatePersonalDetails);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';
const PHONE_DELEGATE_LOCALIZED = '97899 42470';

function lastMenuItemProps() {
    return capturedMenuItemProps.at(-1) ?? {};
}

describe('VacationDelegateMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedMenuItemProps.length = 0;
        mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);
    });

    describe('existing account (personal details available)', () => {
        it('renders the displayName for an email delegate without `@expensify.sms` artifacts', () => {
            const personalDetails: PersonalDetails = {
                accountID: 42,
                login: EMAIL_DELEGATE,
                displayName: 'Jane Doe',
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: EMAIL_DELEGATE}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe('Jane Doe');
            expect(props.description).toBe(EMAIL_DELEGATE);
            expect(props.avatarID).toBe(42);
            expect(JSON.stringify(props)).not.toContain('@expensify.sms');
        });

        // The backend defaults `displayName` to the login, so the title has to be formatted rather than
        // shown as the raw E.164 login it is.
        it('renders the localized phone number for a phone-number account that has no name of its own', () => {
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_WITH_SMS_DOMAIN,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(props.title).not.toBe(PHONE_DELEGATE_RAW);
            expect(props.description).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(props.avatarID).toBe(43);
            expect(JSON.stringify(props)).not.toContain('@expensify.sms');
        });

        // Bug #89578 — the reported case: the backend hands back the login as the display name with the SMS domain
        // already stripped, which used to reach the title as a raw E.164 number complete with its country code.
        it('localizes a display name that is the login without its SMS domain', () => {
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_RAW,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(props.title).not.toBe(PHONE_DELEGATE_RAW);
        });

        it('keeps the name a phone-number account did set, and localizes the number below it', () => {
            const personalDetails: PersonalDetails = {
                accountID: 44,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: 'Jane Doe',
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe('Jane Doe');
            expect(props.description).toBe(PHONE_DELEGATE_LOCALIZED);
        });

        // A local contact is stored without the country code. Personal details come back as E.164, which used
        // to become the title so the status page showed `+91…` above a localized number.
        it('localizes an E.164 display name when the login is still the national form', () => {
            const personalDetails: PersonalDetails = {
                accountID: 45,
                login: '9789942470@expensify.sms',
                displayName: PHONE_DELEGATE_RAW,
            };
            mockUseVacationDelegatePersonalDetails.mockReturnValue(personalDetails);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: '9789942470@expensify.sms'}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(props.title).not.toBe(PHONE_DELEGATE_RAW);
        });
    });

    describe('new account (personal details missing, e.g. after cache clear)', () => {
        it('renders the raw email as title and description when no personal details exist', () => {
            mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: EMAIL_DELEGATE}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(EMAIL_DELEGATE);
            expect(props.description).toBe(EMAIL_DELEGATE);
            expect(JSON.stringify(props)).not.toContain('@expensify.sms');
        });

        // Bug #89578 — the exact scenario reported.
        it('renders the localized phone number when no personal details exist', () => {
            mockUseVacationDelegatePersonalDetails.mockReturnValue(undefined);

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(props.title).not.toBe(PHONE_DELEGATE_RAW);
            expect(props.description).toBe(PHONE_DELEGATE_LOCALIZED);
            expect(JSON.stringify(props)).not.toContain('@expensify.sms');
        });
    });

    it('renders the empty-state menu item when no vacation delegate is set', () => {
        render(
            <VacationDelegateMenuItem
                onCloseError={jest.fn()}
                onPress={jest.fn()}
            />,
        );

        const props = lastMenuItemProps();
        expect(props.description).toBe('common.vacationDelegate');
        expect(props.title).toBeUndefined();
    });
});
