import {render} from '@testing-library/react-native';
import React from 'react';
import CopilotPage from '@pages/settings/Copilot/CopilotPage';
import ONYXKEYS from '@src/ONYXKEYS';

const SESSION_EMAIL = 'me@example.com';

const mockUseOnyx = jest.fn<unknown[], [string]>();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@hooks/usePersonalDetailsByLogin', () => jest.fn(() => ({})));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
    useDelegateNoAccessState: jest.fn(() => ({isActingAsDelegate: false})),
}));

jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountActions: jest.fn(() => ({showLockedAccountModal: jest.fn()})),
    useLockedAccountState: jest.fn(() => ({isAccountLocked: false})),
}));

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (email: string) => email,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
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

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useDocumentTitle', () => jest.fn());

jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Copilots: 1, Members: 1})),
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Pencil: 1, ThreeDots: 1, Trashcan: 1, UserPlus: 1})),
}));

jest.mock('@libs/actions/Delegate', () => ({
    clearDelegateErrorsByField: jest.fn(),
    clearDelegatorErrors: jest.fn(),
    connect: jest.fn(),
    openSecuritySettingsPage: jest.fn(),
    removeDelegate: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn(() => undefined),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns `any`
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spreading `any` from jest.requireActual
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
        useNavigation: jest.fn(() => ({
            navigate: jest.fn(),
            setParams: jest.fn(),
            goBack: jest.fn(),
            addListener: jest.fn(() => jest.fn()),
        })),
    };
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: (args: {safeAreaPaddingBottomStyle: Record<string, unknown>}) => React.ReactNode}) {
        return children({safeAreaPaddingBottomStyle: {}});
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScrollView;
});

jest.mock('@components/SectionSubtitleHTML', () => {
    function MockSectionSubtitleHTML() {
        return null;
    }
    return MockSectionSubtitleHTML;
});

describe('CopilotPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function setOnyxAccount(account: Record<string, unknown> | undefined) {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.ACCOUNT) {
                return [account];
            }
            if (key === ONYXKEYS.SESSION) {
                return [{email: SESSION_EMAIL}];
            }
            return [undefined];
        });
    }

    it('hides both section labels when the user has no delegators or delegates', () => {
        setOnyxAccount({validated: true, delegatedAccess: {delegators: [], delegates: []}});

        const {toJSON} = render(<CopilotPage />);
        const output = JSON.stringify(toJSON());

        expect(output).not.toContain('delegate.youCanAccessTheseAccounts');
        expect(output).not.toContain('delegate.membersCanAccessYourAccount');
        expect(output).toContain('delegate.copilotDelegatedAccess');
        expect(output).toContain('delegate.addCopilot');
    });

    it('renders a delegator row with a Switch button when the user has delegators', () => {
        setOnyxAccount({
            validated: true,
            delegatedAccess: {
                delegators: [{email: 'boss@example.com', role: 'all'}],
                delegates: [],
            },
        });

        const {toJSON} = render(<CopilotPage />);
        const output = JSON.stringify(toJSON());

        expect(output).toContain('boss@example.com');
        expect(output).toContain('delegate.switch');
        expect(output).toContain('delegate.youCanAccessTheseAccounts');
        expect(output).not.toContain('delegate.membersCanAccessYourAccount');
    });

    it('places the delegators (top) section before the delegates (bottom) section', () => {
        setOnyxAccount({
            validated: true,
            delegatedAccess: {
                delegators: [{email: 'boss@example.com', role: 'all'}],
                delegates: [{email: 'assistant@example.com', role: 'submitter'}],
            },
        });

        const {toJSON} = render(<CopilotPage />);
        const output = JSON.stringify(toJSON());

        const topIndex = output.indexOf('delegate.youCanAccessTheseAccounts');
        const bottomIndex = output.indexOf('delegate.membersCanAccessYourAccount');

        expect(topIndex).toBeGreaterThanOrEqual(0);
        expect(bottomIndex).toBeGreaterThan(topIndex);
    });
});
