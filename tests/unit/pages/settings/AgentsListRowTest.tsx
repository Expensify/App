import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import AgentsListRow from '@pages/settings/Agents/AgentsListRow';
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
        getWidthAndHeightStyle: jest.fn(() => ({})),
    })),
);

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@pages/settings/Agents/AgentInfoRow', () => {
    function MockAgentInfoRow({displayName}: {displayName: string}) {
        return displayName;
    }
    return MockAgentInfoRow;
});

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

jest.mock('@components/Button', () => {
    const {TouchableOpacity, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockButton({text, onPress}: {text: string; onPress: () => void}) {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onPress}
            >
                <Text>{text}</Text>
            </TouchableOpacity>
        );
    }
    return MockButton;
});

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function MockPressableWithFeedback({children, onPress, role}: {children: React.ReactNode; onPress: () => void; role?: string}) {
        return (
            <TouchableOpacity
                onPress={onPress}
                accessibilityRole={role as 'button'}
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

describe('AgentsListRow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: false});
    });

    it('narrow layout: does not show Edit button', () => {
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: true});

        const {toJSON} = render(
            <AgentsListRow
                accountID={TEST_ACCOUNT_ID}
                displayName="Test Agent"
                login="agent@example.com"
            />,
        );

        expect(JSON.stringify(toJSON())).not.toContain('common.edit');
    });

    it('wide layout: shows Edit button', () => {
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: false});

        const {toJSON} = render(
            <AgentsListRow
                accountID={TEST_ACCOUNT_ID}
                displayName="Test Agent"
                login="agent@example.com"
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('common.edit');
    });

    it('narrow layout: entire row is pressable', () => {
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: true});

        const {toJSON} = render(
            <AgentsListRow
                accountID={TEST_ACCOUNT_ID}
                displayName="Test Agent"
                login="agent@example.com"
            />,
        );
        const output = JSON.stringify(toJSON());

        expect(output).toContain('button');
    });

    it('wide layout: pressing Edit button calls Navigation.navigate with correct route', () => {
        mockUseResponsiveLayout.mockReturnValue({...BASE_LAYOUT, shouldUseNarrowLayout: false});

        render(
            <AgentsListRow
                accountID={TEST_ACCOUNT_ID}
                displayName="Test Agent"
                login="agent@example.com"
            />,
        );

        fireEvent.press(screen.getByText('common.edit'));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(TEST_ACCOUNT_ID));
    });
});
