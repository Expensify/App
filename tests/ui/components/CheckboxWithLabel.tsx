import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import CheckboxWithLabel from '@src/components/CheckboxWithLabel';
import type {CheckboxWithLabelProps} from '@src/components/CheckboxWithLabel';
import Text from '@src/components/Text';

const LABEL = 'Agree to Terms';
describe('CheckboxWithLabel Component', () => {
    const mockOnInputChange = jest.fn();
    const renderCheckboxWithLabel = (props: Partial<CheckboxWithLabelProps> = {}) =>
        render(
            <CheckboxWithLabel
                label={LABEL}
                onInputChange={mockOnInputChange}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the checkbox with label', () => {
        // Given the component is rendered
        renderCheckboxWithLabel();

        // Then the label is displayed
        expect(screen.getByText(LABEL)).toBeOnTheScreen();
    });

    it('calls onInputChange when the checkbox is pressed', () => {
        // Given the component is rendered
        renderCheckboxWithLabel();

        // When the checkbox is pressed
        const checkbox = screen.getByText(LABEL);
        fireEvent.press(checkbox);

        // Then the onInputChange function should be called with 'true' (checked)
        expect(mockOnInputChange).toHaveBeenCalledWith(true);

        // And when the checkbox is pressed again
        fireEvent.press(checkbox);

        // Then the onInputChange function should be called with 'false' (unchecked)
        expect(mockOnInputChange).toHaveBeenCalledWith(false);
    });

    it('displays error message when errorText is provided', () => {
        // Given the component is rendered with an error message
        const errorText = 'This field is required';
        renderCheckboxWithLabel({errorText});

        // Then the error message is displayed
        expect(screen.getByText(errorText)).toBeOnTheScreen();
    });

    it('renders custom LabelComponent if provided', () => {
        // Given the component is rendered with a custom LabelComponent
        function MockLabelComponent() {
            return <Text>Mock Label Component</Text>;
        }
        renderCheckboxWithLabel({LabelComponent: MockLabelComponent});

        // Then the custom LabelComponent is displayed
        expect(screen.getByText('Mock Label Component')).toBeOnTheScreen();
    });

    it('is accessible and has the correct accessibility label', () => {
        // Given the component is rendered with an accessibility label
        const accessibilityLabel = 'checkbox-agree-to-terms';
        renderCheckboxWithLabel({accessibilityLabel});

        // Then the checkbox should be accessible using the provided label
        const checkbox = screen.getByLabelText(accessibilityLabel);
        expect(checkbox).toBeOnTheScreen();
    });
});
