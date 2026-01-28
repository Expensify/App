import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

// Mock responsive layout to force wide layout
jest.mock('@hooks/useResponsiveLayout', () => (): {shouldUseNarrowLayout: boolean} => ({shouldUseNarrowLayout: false}));

// Silence reanimated warnings
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('react-native-reanimated/mock');
});

describe('NavigationTabBarAvatar hover', () => {
    const onPress = jest.fn();

    const renderAvatar = () =>
        render(
            <OnyxListItemProvider>
                <NavigationTabBarAvatar
                    onPress={onPress}
                    isSelected={false}
                    // Provide stable wrapper style so we can query by role
                    style={{}}
                />
            </OnyxListItemProvider>,
        );

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('shows green ring while hovered', () => {
        renderAvatar();
        const button = screen.getByRole(CONST.ROLE.BUTTON);

        // Before hover, ring should not have border styles
        const ring = screen.getByTestId('avatar-ring');
        expect(ring).not.toHaveStyle({
            borderColor: colors.green400,
            borderWidth: 2,
        });

        fireEvent(button, 'hoverIn');

        // After hover, ring should have correct styles
        expect(ring).toHaveStyle({
            borderColor: colors.green400,
            borderWidth: 2,
        });

        fireEvent(button, 'hoverOut');
        expect(ring).not.toHaveStyle({
            borderColor: colors.green400,
            borderWidth: 2,
        });
    });
});
