/**
 * These tests verify the data passed to `SelectionList` for:
 *  - existing accounts (personal details present) for both email and phone-number logins
 *  - new accounts (personal details missing, e.g. after cache clear) for both email and phone-number logins
 */
import {render} from '@testing-library/react-native';

import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';

import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

import React from 'react';

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
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        FallbackAvatar: 'fallback-avatar',
    })),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));

// `useInitialSelection` relies on React Navigation's `useFocusEffect`, which requires a
// NavigationContainer. In these unit tests we render the component in isolation, so stub the hook
// to synchronously return the current selection (identity) and skip the focus-effect machinery.
jest.mock('@hooks/useInitialSelection', () => jest.fn((selection: string | undefined) => selection));

jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn(() => ({
        searchTerm: '',
        debouncedSearchTerm: '',
        setSearchTerm: jest.fn(),
        availableOptions: {
            recentOptions: [],
            personalDetails: [],
            userToInvite: undefined,
        },
        areOptionsInitialized: true,
    })),
);

jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));

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

jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn(() => undefined),
}));

jest.mock('@libs/PersonalDetailOptionsListUtils', () => ({
    getHeaderMessage: jest.fn(() => ''),
    filterOption: jest.fn(() => true),
}));

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => {
    function MockFullPageOfflineBlockingView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockFullPageOfflineBlockingView;
});

jest.mock('@components/DelegatorList', () => {
    function MockDelegatorList() {
        return null;
    }
    return MockDelegatorList;
});

jest.mock('@components/SelectionList/ListItem/UserListItem', () => {
    function MockUserListItem() {
        return null;
    }
    return MockUserListItem;
});

// Capture the sections passed to SelectionList so the test can assert on the rows that the
// component pushes (the "current selection" row in particular).
type Section = {
    sectionIndex?: number;
    data?: Array<Record<string, unknown>>;
};
const capturedSectionsList: Section[][] = [];

jest.mock('@components/SelectionList/SelectionListWithSections', () => {
    function MockSelectionList(props: {sections?: Section[]}) {
        capturedSectionsList.push(props.sections ?? []);
        return null;
    }
    return MockSelectionList;
});

const mockGetPersonalDetailByEmail = jest.mocked(getPersonalDetailByEmail);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';

function lastCurrentSelectionRow() {
    const sections = capturedSectionsList.at(-1) ?? [];
    const currentSection = sections.find((section) => section.sectionIndex === 0);
    return currentSection?.data?.at(0);
}

function toIconsArray(value: unknown): Array<Record<string, unknown>> | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }
    return value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
}

describe('BaseVacationDelegateSelectionComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedSectionsList.length = 0;
        mockGetPersonalDetailByEmail.mockReturnValue(undefined);
    });

    function renderComponent(delegate: string | undefined) {
        return render(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={delegate ? {delegate} : undefined}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="cannot"
            />,
        );
    }

    describe('existing account (personal details available)', () => {
        it('renders the current delegate row with the displayName for an email account', () => {
            const personalDetails: PersonalDetails = {
                accountID: 42,
                login: EMAIL_DELEGATE,
                displayName: 'Jane Doe',
                avatar: 'jane-avatar',
            };
            mockGetPersonalDetailByEmail.mockReturnValue(personalDetails);

            renderComponent(EMAIL_DELEGATE);

            const row = lastCurrentSelectionRow();
            expect(row).toBeDefined();
            expect(row?.text).toBe('Jane Doe');
            expect(row?.login).toBe(EMAIL_DELEGATE);
            expect(row?.accountID).toBe(42);
            expect(row?.isSelected).toBe(true);
            expect(JSON.stringify(row)).not.toContain('@expensify.sms');
        });

        it('renders the current delegate row with the formatted phone number for an existing phone account', () => {
            // Server-provided personal details for a phone account typically carry the clean,
            // formatted phone number as `displayName` (no `@expensify.sms` suffix), while `login`
            // still carries the canonicalized SMS form.
            const personalDetails: PersonalDetails = {
                accountID: 43,
                login: PHONE_DELEGATE_WITH_SMS_DOMAIN,
                displayName: PHONE_DELEGATE_RAW,
                avatar: 'phone-avatar',
            };
            mockGetPersonalDetailByEmail.mockReturnValue(personalDetails);

            renderComponent(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            const row = lastCurrentSelectionRow();
            expect(row).toBeDefined();
            expect(row?.text).toBe(PHONE_DELEGATE_RAW);
            expect(row?.alternateText).toBe(PHONE_DELEGATE_RAW);
            expect(row?.login).toBe(PHONE_DELEGATE_WITH_SMS_DOMAIN);
            expect(row?.accountID).toBe(43);
            expect(row?.isSelected).toBe(true);
            // The icon id must be the real accountID when personal details are present.
            const icons = toIconsArray(row?.icons);
            expect(icons?.at(0)?.id).toBe(43);
        });
    });

    describe('new account (personal details missing, e.g. after cache clear)', () => {
        // The current delegate is excluded from the recents/contacts/userToInvite sections via
        // `excludeLogins`, so the pinned row is the only place it can appear. It must still render
        // (falling back to the raw login and DEFAULT_MISSING_ID) even when personal details are gone.
        it('still pins the current delegate row for an email account when personal details are missing', () => {
            mockGetPersonalDetailByEmail.mockReturnValue(undefined);

            renderComponent(EMAIL_DELEGATE);

            const row = lastCurrentSelectionRow();
            expect(row).toBeDefined();
            expect(row?.text).toBe(EMAIL_DELEGATE);
            expect(row?.login).toBe(EMAIL_DELEGATE);
            expect(row?.accountID).toBe(CONST.DEFAULT_MISSING_ID);
            expect(row?.isSelected).toBe(true);
            expect(JSON.stringify(row)).not.toContain('@expensify.sms');
        });

        // Bug #89578 — the exact scenario reported.
        it('still pins the current delegate row for a phone account when personal details are missing', () => {
            mockGetPersonalDetailByEmail.mockReturnValue(undefined);

            renderComponent(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            const row = lastCurrentSelectionRow();
            expect(row).toBeDefined();
            expect(row?.text).toBe(PHONE_DELEGATE_RAW);
            expect(row?.alternateText).toBe(PHONE_DELEGATE_RAW);
            expect(row?.login).toBe(PHONE_DELEGATE_WITH_SMS_DOMAIN);
            expect(row?.accountID).toBe(CONST.DEFAULT_MISSING_ID);
            expect(row?.isSelected).toBe(true);
            // Avatar icon id must also fall back to DEFAULT_MISSING_ID so UserListItem renders the
            // fallback avatar rather than gating it off behind a missing accountID.
            const icons = toIconsArray(row?.icons);
            expect(icons?.at(0)?.id).toBe(CONST.DEFAULT_MISSING_ID);
        });
    });

    it('does not render a current selection row when there is no vacation delegate', () => {
        renderComponent(undefined);

        const row = lastCurrentSelectionRow();
        expect(row).toBeUndefined();
    });
});
