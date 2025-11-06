import {NavigationContainer} from '@react-navigation/native';
import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

describe('FloatingReceiptButton hover', () => {
    const onPress = jest.fn();

    const renderFAB = () =>
        render(
            <NavigationContainer>
                <FloatingReceiptButton
                    onPress={onPress}
                    accessibilityLabel="fab"
                    role={CONST.ROLE.BUTTON}
                />
            </NavigationContainer>,
        );

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('changes background color on hover', () => {
        renderFAB();

        // Get the receipt button by testID
        const frb = screen.getByTestId('floating-receipt-button');

        // Get the container by testID
        const container = screen.getByTestId('floating-receipt-button-container');

        // Before hover, should not have greenHover background
        expect(container).not.toHaveStyle({backgroundColor: colors.greenHover});

        // Test hover in
        fireEvent(frb, 'hoverIn');
        expect(container).toHaveStyle({backgroundColor: colors.greenHover});

        // Test hover out
        fireEvent(frb, 'hoverOut');
        expect(container).not.toHaveStyle({backgroundColor: colors.greenHover});
    });
});
