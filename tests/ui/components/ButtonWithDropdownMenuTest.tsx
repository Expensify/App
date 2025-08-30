import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';

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
        render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
            />,
        );
        expect(screen.getByText('Test Option')).toBeTruthy();
    });

    it('calls all relevant callbacks when the button is pressed', () => {
        render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
            />,
        );
        fireEvent.press(screen.getByText('Test Option'));
        expect(mockOnSelected).toHaveBeenCalled();
        expect(mockOnOptionSelected).not.toHaveBeenCalled(); // onSelected takes precedence
        expect(mockOnSubItemSelected).toHaveBeenCalledWith(expect.objectContaining(option), 0, undefined);
        expect(mockOnPress).not.toHaveBeenCalled(); // onPress should not be called when onSelected exists to prevent double execution
    });

    it('renders the icon from the option along with the text', () => {
        render(
            <ButtonWithDropdownMenu
                options={[option]}
                onPress={mockOnPress}
                onOptionSelected={mockOnOptionSelected}
                onSubItemSelected={mockOnSubItemSelected}
                shouldUseOptionIcon
                testID={CONST.ICON_TEST_ID}
            />,
        );
        const iconNodes = screen.getAllByTestId(CONST.ICON_TEST_ID);
        expect(iconNodes.length).toBeGreaterThan(0);
        expect(screen.getByText('Test Option')).toBeTruthy();
    });
});
