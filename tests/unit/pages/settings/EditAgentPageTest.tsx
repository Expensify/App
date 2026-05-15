import {render} from '@testing-library/react-native';
import React from 'react';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import EditAgentPage from '@pages/settings/Agents/EditAgentPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

jest.mock('@userActions/Agent', () => ({
    deleteAgent: jest.fn(),
    clearAgentUpdateError: jest.fn(),
}));

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

jest.mock('@hooks/useStyleUtils', () =>
    jest.fn(() => ({
        getWidthAndHeightStyle: jest.fn(() => ({})),
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Trashcan: 1})),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
    };
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
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

jest.mock('@components/ConfirmModal', () => {
    function MockConfirmModal({confirmText}: {confirmText: string}) {
        return confirmText ?? null;
    }
    return MockConfirmModal;
});

jest.mock('@components/MenuItem', () => {
    function MockMenuItem({title}: {title: string}) {
        return title ?? null;
    }
    return MockMenuItem;
});

jest.mock('@components/MenuItemWithTopDescription', () => {
    function MockMenuItemWithTopDescription({title, description}: {title: string; description: string}) {
        return `${description}::${title}`;
    }
    return MockMenuItemWithTopDescription;
});

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children, errors}: {children: React.ReactNode; errors?: Record<string, unknown> | null}) {
        return (
            <>
                {children}
                {errors ? JSON.stringify(errors) : null}
            </>
        );
    }
    return MockOfflineWithFeedback;
});

jest.mock('@components/ReportActionAvatars', () => {
    function MockReportActionAvatars() {
        return null;
    }
    return MockReportActionAvatars;
});

const mockUseOnyx = jest.mocked(useOnyx);

const TEST_ACCOUNT_ID = 12345;

type EditAgentPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>['route'];
type EditAgentPageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>['navigation'];

const mockRoute = {params: {accountID: TEST_ACCOUNT_ID}} as EditAgentPageRoute;
const mockNavigation = {} as EditAgentPageNavigation;

describe('EditAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('renders agent name from personalDetails', () => {
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [{displayName: 'Test Agent'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Test Agent');
    });

    it('renders prompt from agent Onyx key', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Reject all gambling expenses.'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Reject all gambling expenses.');
    });

    it('renders delete agent menu item', () => {
        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('editAgentPage.deleteAgent');
    });

    it('shows error text when agent has nameErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', nameErrors: {someKey: 'agentsPage.error.updateName'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updateName');
    });

    it('shows error text when agent has promptErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', promptErrors: {someKey: 'agentsPage.error.updatePrompt'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updatePrompt');
    });
});
