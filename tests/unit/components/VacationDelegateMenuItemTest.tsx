/**
 * These tests verify that the menu item correctly renders:
 *  - existing accounts (personal details present) for both email and phone-number logins
 *  - new accounts (personal details missing, e.g. after cache clear) for both email and phone-number logins
 */
import {render} from '@testing-library/react-native';
import React from 'react';
import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import type {PersonalDetails} from '@src/types/onyx';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
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

jest.mock('@hooks/usePersonalDetailsByLogin', () => jest.fn(() => ({})));

// formatPhoneNumber depends on Onyx country code, which is not initialized in this unit test.
// Replace it with a deterministic implementation that mirrors the part of the real behavior the
// fix relies on: strip the SMS domain so a phone-number login is no longer rendered as
// `<phone>@expensify.sms`, and return non-phone strings (e.g. emails) untouched.
jest.mock('@libs/LocalePhoneNumber', () => ({
    formatPhoneNumber: jest.fn((value: string) => {
        if (!value) {
            return '';
        }
        return value.replace('@expensify.sms', '');
    }),
}));

// `parsePhoneNumber` runs through awesome-phonenumber and would actually transform a number like
// `+919789942470` into the Indian national format (e.g. `97899 42470`). For unit-test purposes we
// just need a deterministic stub: treat anything starting with `+` followed by digits as a valid
// phone whose national form is the raw E.164 string. That keeps the data-flow assertions stable
// while still exercising the same code path (valid? -> national; invalid -> fallback).
jest.mock('@libs/PhoneNumber', () => ({
    parsePhoneNumber: jest.fn((value: string) => {
        const isPhone = /^\+\d+$/.test(value);
        return {
            valid: isPhone,
            number: isPhone ? {national: value} : undefined,
        };
    }),
}));

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

const mockUsePersonalDetailsByLogin = jest.mocked(usePersonalDetailsByLogin);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';

function lastMenuItemProps() {
    return capturedMenuItemProps.at(-1) ?? {};
}

describe('VacationDelegateMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedMenuItemProps.length = 0;
        mockUsePersonalDetailsByLogin.mockReturnValue({});
    });

    describe('existing account (personal details available)', () => {
        it('renders the displayName for an email delegate without `@expensify.sms` artifacts', () => {
            const personalDetails: PersonalDetails = {
                accountID: 42,
                login: EMAIL_DELEGATE,
                displayName: 'Jane Doe',
            };
            mockUsePersonalDetailsByLogin.mockReturnValue({[EMAIL_DELEGATE.toLowerCase()]: personalDetails});

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

        it('renders the formatted phone number for an existing phone-number account (no `@expensify.sms`)', () => {
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_WITH_SMS_DOMAIN,
            };
            mockUsePersonalDetailsByLogin.mockReturnValue({[PHONE_DELEGATE_WITH_SMS_DOMAIN.toLowerCase()]: personalDetails});

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_RAW);
            expect(props.description).toBe(PHONE_DELEGATE_RAW);
            expect(props.avatarID).toBe(43);
            expect(JSON.stringify(props)).not.toContain('@expensify.sms');
        });
    });

    describe('new account (personal details missing, e.g. after cache clear)', () => {
        it('renders the raw email as title and description when no personal details exist', () => {
            mockUsePersonalDetailsByLogin.mockReturnValue({});

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
        it('renders the formatted phone number (no `@expensify.sms`) when no personal details exist', () => {
            mockUsePersonalDetailsByLogin.mockReturnValue({});

            render(
                <VacationDelegateMenuItem
                    vacationDelegate={{delegate: PHONE_DELEGATE_WITH_SMS_DOMAIN}}
                    onCloseError={jest.fn()}
                    onPress={jest.fn()}
                />,
            );

            const props = lastMenuItemProps();
            expect(props.title).toBe(PHONE_DELEGATE_RAW);
            expect(props.description).toBe(PHONE_DELEGATE_RAW);
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
