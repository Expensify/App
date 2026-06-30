import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import type {AgentRowData} from '@components/Tables/AgentsTable';
import AgentsTableRow from '@components/Tables/AgentsTable/AgentsTableRow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

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
        getBackgroundAndBorderStyle: jest.fn(() => ({})),
    })),
);

jest.mock('@hooks/useTheme', () =>
    jest.fn(() => ({
        sidebar: '#fff',
        icon: '#000',
        danger: '#f00',
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({ArrowRight: 1, DotIndicator: 1})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@components/Table/TableContext', () => ({
    useTableContext: jest.fn(() => ({
        processedData: [{keyForList: '12345'}],
        columns: [{width: undefined}, {width: 20}],
        shouldUseNarrowTableLayout: false,
        tableMethods: {},
        selectionEnabled: false,
        isMobileSelectionEnabled: false,
    })),
}));

jest.mock('@components/ReportActionAvatars', () => {
    function MockReportActionAvatars() {
        return null;
    }
    return MockReportActionAvatars;
});

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockOfflineWithFeedback;
});

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function MockPressableWithFeedback({children, onPress, accessibilityLabel}: {children: React.ReactNode; onPress: () => void; accessibilityLabel?: string}) {
        return (
            <TouchableOpacity
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </TouchableOpacity>
        );
    }
    return MockPressableWithFeedback;
});

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockNavigate = jest.mocked(Navigation.navigate);

const TEST_ACCOUNT_ID = 12345;

const BASE_ITEM: AgentRowData = {
    keyForList: String(TEST_ACCOUNT_ID),
    accountID: TEST_ACCOUNT_ID,
    displayName: 'Test Agent',
    login: 'agent@example.com',
    hasUpdateErrors: false,
    action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(TEST_ACCOUNT_ID)),
    dismissError: jest.fn(),
};

const BASE_LAYOUT = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
};

describe('AgentsTableRow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: false});
    });

    it('pressing the row navigates to the edit agent page', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        fireEvent.press(screen.getByLabelText('Test Agent, agent@example.com'));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(TEST_ACCOUNT_ID));
    });

    it('does not show action buttons on wide layout', () => {
        const {toJSON} = render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        const output = JSON.stringify(toJSON());
        expect(output).not.toContain('common.edit');
        expect(output).not.toContain('editAgentPage.chatWithAgent');
        expect(output).not.toContain('delegate.copilot');
    });

    it('does not show action buttons on narrow layout', () => {
        const {toJSON} = render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout
            />,
        );

        const output = JSON.stringify(toJSON());
        expect(output).not.toContain('common.edit');
        expect(output).not.toContain('editAgentPage.chatWithAgent');
        expect(output).not.toContain('delegate.copilot');
    });
});
