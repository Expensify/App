import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import NavigationTabBarAvatar from '@pages/home/sidebar/NavigationTabBarAvatar';
import CONST from '@src/CONST';
import lightTheme from '@styles/theme/themes/light';

// Mock responsive layout to force wide layout
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

// Silence reanimated warnings
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

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

    it('shows green ring while hovered', () => {
        renderAvatar();
        const button = screen.getByRole(CONST.ROLE.BUTTON);

        // Before hover, ring should not have border styles
        const ring = screen.getByTestId('avatar-ring');
        expect(ring).not.toHaveStyle({
            borderColor: lightTheme.success,
            borderWidth: 2,
        });

        fireEvent(button, 'hoverIn');

        // After hover, ring should have correct styles
        expect(ring).toHaveStyle({
            borderColor: lightTheme.success,
            borderWidth: 2,
        });

        fireEvent(button, 'hoverOut');
        expect(ring).not.toHaveStyle({
            borderColor: lightTheme.success,
            borderWidth: 2,
        });
    });
});
