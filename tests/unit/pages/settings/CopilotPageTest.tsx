import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import CopilotPage from '@pages/settings/Copilot/CopilotPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const SESSION_EMAIL = 'me@example.com';
const OWNER_EMAIL = 'owner@example.com';
let mockIsAgentAccount = false;
let mockPersonalDetailsByLogin: Record<string, {displayName: string}> = {};

jest.mock('@hooks/useIsAgentAccount', () => () => mockIsAgentAccount);

const mockUseOnyx = jest.fn<unknown[], [string]>();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const result = mockUseOnyx(key);
        if (options?.selector) {
            return [options.selector(result.at(0) ?? undefined)];
        }
        return result;
    },
}));

jest.mock('@hooks/usePersonalDetailsByLogin', () => jest.fn(() => mockPersonalDetailsByLogin));

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
                    get: (_target, property) => (property === 'searchBarWidth' ? () => ({}) : {}),
                },
            ),
    ),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useDocumentTitle', () => jest.fn());

jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Copilots: 1, Members: 1})),
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Pencil: 'icon-pencil', ThreeDots: 'icon-three-dots', Trashcan: 'icon-trashcan', UserPlus: 'icon-user-plus'})),
}));

jest.mock('@libs/actions/Delegate', () => ({
    clearDelegateErrorsByField: jest.fn(),
    clearDelegatorErrors: jest.fn(),
    connect: jest.fn(),
    openSecuritySettingsPage: jest.fn(),
    removeDelegate: jest.fn(),
    removeDelegator: jest.fn(),
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

jest.mock('@components/SearchBar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-imports -- require() returns an untyped module; the React Native component annotations are supplied by JSX usage
    const {Text, TextInput}: typeof import('react-native') = require('react-native');
    function MockSearchBar({
        label,
        inputValue,
        onChangeText,
        shouldShowEmptyState,
    }: {
        label: string;
        inputValue: string;
        onChangeText: (value: string) => void;
        shouldShowEmptyState?: boolean;
    }) {
        return (
            <>
                <TextInput
                    accessibilityLabel={label}
                    value={inputValue}
                    onChangeText={onChangeText}
                />
                {!!shouldShowEmptyState && <Text>common.noResultsFoundMatching</Text>}
            </>
        );
    }
    return MockSearchBar;
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
        mockIsAgentAccount = false;
        mockPersonalDetailsByLogin = {};
    });

    function setOnyxAccount(account: Record<string, unknown> | undefined, overrides: {sessionEmail?: string} = {}) {
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.ACCOUNT) {
                return [account];
            }
            if (key === ONYXKEYS.SESSION) {
                return [{email: overrides.sessionEmail ?? SESSION_EMAIL}];
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

    it('renders a delegator row with a three-dot menu when the user has delegators', () => {
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
        expect(output).toContain('icon-three-dots');
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

    it('hides the three-dot menu for the acting-delegate row on an agent account but keeps it for other delegates', () => {
        const twoDelegates = [
            {email: OWNER_EMAIL, role: 'all'},
            {email: 'other@example.com', role: 'submitter'},
        ];

        setOnyxAccount({validated: true, delegatedAccess: {delegators: [], delegates: twoDelegates, delegate: OWNER_EMAIL}}, {sessionEmail: SESSION_EMAIL});
        const nonAgentOutput = JSON.stringify(render(<CopilotPage />).toJSON());
        const nonAgentCount = nonAgentOutput.split('icon-three-dots').length - 1;
        expect(nonAgentCount).toBeGreaterThan(0);
        expect(nonAgentCount % 2).toBe(0);
        const occurrencesPerRow = nonAgentCount / 2;

        mockIsAgentAccount = true;
        setOnyxAccount({validated: true, delegatedAccess: {delegators: [], delegates: twoDelegates, delegate: OWNER_EMAIL}});
        const agentOutput = JSON.stringify(render(<CopilotPage />).toJSON());
        const agentCount = agentOutput.split('icon-three-dots').length - 1;

        expect(agentOutput).toContain(OWNER_EMAIL);
        expect(agentOutput).toContain('other@example.com');
        expect(agentCount).toBe(occurrencesPerRow);
    });

    it('shows search at 12 combined displayed relationships but not at 11', () => {
        const delegators = Array.from({length: 6}, (_, index) => ({email: `delegator-${index}@example.com`, role: 'all'}));
        const delegates = Array.from({length: 6}, (_, index) => ({email: `delegate-${index}@example.com`, role: 'submitter'}));
        setOnyxAccount({validated: true, delegatedAccess: {delegators, delegates: delegates.slice(0, 5)}});
        const {rerender} = render(<CopilotPage />);
        expect(screen.queryByLabelText('workspace.people.findMember')).toBeNull();

        setOnyxAccount({validated: true, delegatedAccess: {delegators, delegates}});
        rerender(<CopilotPage />);
        expect(screen.getByLabelText('workspace.people.findMember')).toBeOnTheScreen();
    });

    it('does not count optimistic delegates toward the search threshold', () => {
        const delegates = Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT}, (_, index) => ({
            email: `delegate-${index}@example.com`,
            role: 'submitter',
            optimisticAccountID: index === 0 ? 123 : undefined,
        }));
        setOnyxAccount({validated: true, delegatedAccess: {delegators: [], delegates}});

        render(<CopilotPage />);
        expect(screen.queryByLabelText('workspace.people.findMember')).toBeNull();
    });

    it('filters both sections by display name and email while keeping Add copilot available', async () => {
        const matchingDelegatorEmail = 'delegator-5@example.com';
        const matchingDelegateEmail = 'delegate-5@example.com';
        const delegators = Array.from({length: 6}, (_, index) => ({email: `delegator-${index}@example.com`, role: 'all'}));
        const delegates = Array.from({length: 6}, (_, index) => ({email: `delegate-${index}@example.com`, role: 'submitter'}));
        mockPersonalDetailsByLogin = {
            [matchingDelegatorEmail]: {displayName: 'Matching Boss'},
            [matchingDelegateEmail]: {displayName: 'Matching Assistant'},
        };
        setOnyxAccount({validated: true, delegatedAccess: {delegators, delegates}});
        const {toJSON} = render(<CopilotPage />);

        fireEvent.changeText(screen.getByLabelText('workspace.people.findMember'), 'Matching Boss');
        await waitFor(() => {
            const output = JSON.stringify(toJSON());
            expect(output).toContain('Matching Boss');
            expect(output).not.toContain('Matching Assistant');
            expect(output).toContain('delegate.youCanAccessTheseAccounts');
            expect(output).not.toContain('delegate.membersCanAccessYourAccount');
            expect(output).toContain('delegate.addCopilot');
        });

        fireEvent.changeText(screen.getByLabelText('workspace.people.findMember'), matchingDelegateEmail);
        await waitFor(() => {
            const output = JSON.stringify(toJSON());
            expect(output).toContain('Matching Assistant');
            expect(output).not.toContain('Matching Boss');
            expect(output).not.toContain('delegate.youCanAccessTheseAccounts');
            expect(output).toContain('delegate.membersCanAccessYourAccount');
        });

        fireEvent.changeText(screen.getByLabelText('workspace.people.findMember'), 'no matching copilot');
        await waitFor(() => {
            const output = JSON.stringify(toJSON());
            expect(output).not.toContain('delegate.youCanAccessTheseAccounts');
            expect(output).not.toContain('delegate.membersCanAccessYourAccount');
            expect(output).toContain('common.noResultsFoundMatching');
            expect(output).toContain('delegate.addCopilot');
        });
    });
});
