import {fireEvent, render, screen} from '@testing-library/react-native';

import type {AgentRowData} from '@components/Tables/AgentsTable';
import AgentsTableRow from '@components/Tables/AgentsTable/AgentsTableRow';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type ReactNative from 'react-native';

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

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({ArrowRight: 1, DotIndicator: 1, ChatBubble: 1})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@components/Table/TableContext', () => ({
    useTableContext: jest.fn(() => ({
        processedData: [{keyForList: '12345'}],
        columns: [{width: undefined}, {width: 260}],
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

jest.mock('@components/Icon', () => {
    function MockIcon() {
        return null;
    }
    return MockIcon;
});

jest.mock('@components/TextWithTooltip', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockTextWithTooltip({text}: {text: string}) {
        return <Text>{text}</Text>;
    }
    return MockTextWithTooltip;
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- react-native-reanimated mock is untyped
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockOfflineWithFeedback;
});

jest.mock('@components/ButtonComposed', () => {
    const {TouchableOpacity, Text} = jest.requireActual<typeof ReactNative>('react-native');

    function MockButtonIcon() {
        return null;
    }

    function MockButtonText({children}: {children: React.ReactNode}) {
        return <Text>{children}</Text>;
    }

    function MockButton({children, onPress, accessibilityLabel, isDisabled}: {children: React.ReactNode; onPress: () => void; accessibilityLabel?: string; isDisabled?: boolean}) {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                onPress={onPress}
                disabled={isDisabled}
            >
                {children}
            </TouchableOpacity>
        );
    }

    MockButton.Icon = MockButtonIcon;
    MockButton.Text = MockButtonText;

    return MockButton;
});

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function MockPressableWithFeedback({
        children,
        onPress,
        accessibilityLabel,
    }: {
        children: React.ReactNode | ((state: {hovered: boolean; pressed: boolean}) => React.ReactNode);
        onPress: () => void;
        accessibilityLabel?: string;
    }) {
        const content = typeof children === 'function' ? children({hovered: false, pressed: false}) : children;

        return (
            <TouchableOpacity
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
            >
                {content}
            </TouchableOpacity>
        );
    }
    return MockPressableWithFeedback;
});

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockNavigate = jest.mocked(Navigation.navigate);

const TEST_ACCOUNT_ID = 12345;

const mockOnChatPress = jest.fn();
const mockOnCopilotPress = jest.fn();

const BASE_ITEM: AgentRowData = {
    keyForList: String(TEST_ACCOUNT_ID),
    accountID: TEST_ACCOUNT_ID,
    displayName: 'Test Agent',
    login: 'agent@example.com',
    action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(TEST_ACCOUNT_ID)),
    onChatPress: mockOnChatPress,
    onCopilotPress: mockOnCopilotPress,
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

    it('shows action buttons on wide layout', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        expect(screen.getByText('common.edit')).toBeOnTheScreen();
        expect(screen.getByText('delegate.copilot')).toBeOnTheScreen();
        expect(screen.getByLabelText('editAgentPage.chatWithAgent')).toBeOnTheScreen();
    });

    it('does not show action buttons on narrow layout', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout
            />,
        );

        expect(screen.queryByText('common.edit')).not.toBeOnTheScreen();
        expect(screen.queryByText('delegate.copilot')).not.toBeOnTheScreen();
        expect(screen.queryByLabelText('editAgentPage.chatWithAgent')).not.toBeOnTheScreen();
    });

    it('pressing Edit button navigates to the edit agent page', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        fireEvent.press(screen.getByText('common.edit'));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(TEST_ACCOUNT_ID));
    });

    it('pressing Chat button calls onChatPress', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        fireEvent.press(screen.getByLabelText('editAgentPage.chatWithAgent'));

        expect(mockOnChatPress).toHaveBeenCalledTimes(1);
    });

    it('pressing Copilot button calls onCopilotPress', () => {
        render(
            <AgentsTableRow
                item={BASE_ITEM}
                rowIndex={0}
                shouldUseNarrowTableLayout={false}
            />,
        );

        fireEvent.press(screen.getByLabelText('editAgentPage.copilotIntoAccount'));

        expect(mockOnCopilotPress).toHaveBeenCalledTimes(1);
    });
});
