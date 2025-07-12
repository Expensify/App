import React from 'react';
import {render, fireEvent, RenderAPI} from '@testing-library/react-native';
import type {ReactTestInstance} from 'react-test-renderer';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import * as Expensicons from '@components/Icon/Expensicons';

describe('ButtonWithDropdownMenu (single option)', () => {
    const mockOnSelected = jest.fn();
    const mockOnOptionSelected = jest.fn();
    const mockOnSubItemSelected = jest.fn();
    const mockOnPress = jest.fn();
    const option = {
        value: 'test',
        text: 'Test Option',
        icon: Expensicons.Checkbox,
        onSelected: mockOnSelected,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a button (not a dropdown) when only one option is present', () => {
        // Given a single option
        const {getByText} = render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
            />
        );
        // When the component is rendered
        // Then it should render a button with the option text
        expect(getByText('Test Option')).toBeTruthy();
    });

    it('calls all relevant callbacks when the button is pressed', () => {
        // Given a single option with all callbacks
        const {getByText} = render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
            />
        );
        // When the button is pressed
        fireEvent.press(getByText('Test Option'));
        // Then all relevant callbacks should be called
        expect(mockOnSelected).toHaveBeenCalled();
        expect(mockOnOptionSelected).not.toHaveBeenCalled(); // onSelected takes precedence
        expect(mockOnSubItemSelected).toHaveBeenCalledWith(expect.objectContaining(option), 0, undefined);
        expect(mockOnPress).toHaveBeenCalledWith(undefined, 'test');
    });

    it('renders the icon from the option along with the text', () => {
        // Given a single option with an icon
        const {getByText, UNSAFE_getAllByProps}: RenderAPI = render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
            />
        );
        // When the component is rendered
        // Then the icon should be present in the tree by props
        const iconNodes: ReactTestInstance[] = UNSAFE_getAllByProps({src: Expensicons.Checkbox});
        expect(iconNodes.length).toBeGreaterThan(0);
        // And the button text should still be present
        expect(getByText('Test Option')).toBeTruthy();
    });
}); 