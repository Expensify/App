import {render} from '@testing-library/react-native';

import ConfirmDelegatePage from '@pages/settings/Security/AddDelegate/ConfirmDelegatePage';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import React from 'react';

// `addSMSDomainIfPhoneNumber` builds an SMS login from the parsed e164, so a real one always carries the `+`.
// Without it `parsePhoneNumber` has no region to work from, reports the number invalid, and no formatting happens.
const SMS_LOGIN = `+2347045473755${CONST.SMS.DOMAIN}`;
const FORMATTED_SMS_LOGIN = '+234 704 547 3755';
const MOCK_ROUTE = {
    key: `${SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM}-test`,
    name: SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM,
    params: {login: SMS_LOGIN, role: CONST.DELEGATE_ROLE.ALL},
} as const;

// The page never reads `navigation`. It routes through the `Navigation` singleton, mocked below.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const MOCK_NAVIGATION = {} as React.ComponentProps<typeof ConfirmDelegatePage>['navigation'];

const mockUsePersonalDetailByLogin = jest.fn<{displayName?: string; accountID?: number; avatar?: string} | undefined, [string | undefined]>();

// The real formatter, so these assert the string a copilot actually reads rather than a stand-in.
jest.mock('@hooks/useLocalize', () => {
    const {formatPhoneNumber} = jest.requireActual<{formatPhoneNumber: (value: string) => string}>('@libs/LocalePhoneNumber');
    return jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    }));
});

// Stands in for the personal details context the real hook reads, so these tests need no provider.
jest.mock('@hooks/usePersonalDetailByLogin', () => ({
    __esModule: true,
    default: (login: string | undefined) => mockUsePersonalDetailByLogin(login),
}));

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

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
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'icon-fallback-avatar'})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@components/HeaderPageLayout', () => {
    function MockHeaderPageLayout({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockHeaderPageLayout;
});

jest.mock('@components/DelegateNoAccessWrapper', () => {
    function MockDelegateNoAccessWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockDelegateNoAccessWrapper;
});

jest.mock('@components/ButtonComposed', () => {
    function MockButton() {
        return null;
    }
    return Object.assign(MockButton, {Icon: MockButton, Text: MockButton, KeyboardShortcut: MockButton});
});

jest.mock('@components/Text', () => {
    function MockText({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockText;
});

jest.mock('@components/Avatar/UserAvatar', () => {
    function MockUserAvatar() {
        return null;
    }
    return MockUserAvatar;
});

jest.mock('@components/MenuItemWithTopDescription', () => {
    function MockMenuItemWithTopDescription() {
        return null;
    }
    return MockMenuItemWithTopDescription;
});

describe('ConfirmDelegatePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function renderPage() {
        return JSON.stringify(
            render(
                <ConfirmDelegatePage
                    route={MOCK_ROUTE}
                    navigation={MOCK_NAVIGATION}
                />,
            ).toJSON(),
        );
    }

    it('formats the title when an SMS account never set a display name', () => {
        // An account that never set a name carries its own login in `displayName`, domain and all.
        mockUsePersonalDetailByLogin.mockReturnValue({displayName: SMS_LOGIN, accountID: 42});

        const output = renderPage();

        expect(output).toContain(FORMATTED_SMS_LOGIN);
        expect(output).not.toContain(CONST.SMS.DOMAIN);
    });

    it('formats the title when the account has no personal details at all', () => {
        mockUsePersonalDetailByLogin.mockReturnValue(undefined);

        const output = renderPage();

        expect(output).toContain(FORMATTED_SMS_LOGIN);
        expect(output).not.toContain(CONST.SMS.DOMAIN);
    });

    it('keeps a real display name as the title and the formatted login as the description', () => {
        mockUsePersonalDetailByLogin.mockReturnValue({displayName: 'Ada Lovelace', accountID: 7});

        const output = renderPage();

        // `formatPhoneNumber` returns a non-phone string untouched apart from swapping its spaces for
        // non-breaking ones, which is what the 41 other call sites wrapping a display name already do.
        expect(output).toContain('Ada\u00A0Lovelace');
        expect(output).toContain(FORMATTED_SMS_LOGIN);
    });
});
