import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import colors from '@styles/theme/colors';
import Button from '@src/components/Button';
import type {ButtonProps} from '@src/components/Button';
import CONST from '@src/CONST';

const buttonText = 'Click me';
const accessibilityLabel = 'button-label';

describe('Button Component', () => {
    const renderButton = (props: ButtonProps = {}) =>
        render(
            <Button
                text={buttonText}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />,
        );
    const onPress = jest.fn();
    const getButton = () => screen.getByRole(CONST.ROLE.BUTTON, {name: buttonText});

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with default text', () => {
        // Given the component is rendered
        renderButton();

        // Then the default text is displayed
        expect(screen.getByText(buttonText)).toBeOnTheScreen();
    });

    it('renders without text gracefully', () => {
        // Given the component is rendered without text
        renderButton({text: undefined});

        // Then the button is not displayed
        expect(screen.queryByText(buttonText)).not.toBeOnTheScreen();
    });

    it('handles press event correctly', () => {
        // Given the component is rendered with an onPress function
        renderButton({onPress});

        // When the button is pressed
        fireEvent.press(getButton());

        // Then the onPress function should be called
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders loading state', () => {
        // Given the component is rendered with isLoading
        renderButton({isLoading: true});

        // Then the loading state is displayed
        expect(screen.getByText(buttonText)).not.toBeVisible();
    });

    it('disables button when isDisabled is true', () => {
        // Given the component is rendered with isDisabled true
        renderButton({isDisabled: true});

        // Then the button is disabled
        expect(getButton()).toHaveStyle({opacity: 0.5});
        expect(getButton()).toHaveStyle({boxShadow: 'none'});
        expect(getButton()).toHaveStyle({outlineStyle: 'none'});
    });

    it('sets accessibility label correctly', () => {
        // Given the component is rendered with an accessibility label
        renderButton({accessibilityLabel});

        // Then the button should be accessible using the provided label
        expect(screen.getByLabelText(accessibilityLabel)).toBeOnTheScreen();
    });

    it('applies custom styles correctly', () => {
        // Given the component is rendered with custom styles
        renderButton({accessibilityLabel, innerStyles: {width: '100%'}});

        // Then the button should have the custom styles
        const buttonContainer = screen.getByLabelText(accessibilityLabel);
        expect(buttonContainer).toHaveStyle({backgroundColor: colors.productDark400});
        expect(buttonContainer).toHaveStyle({width: '100%'});
    });
});
