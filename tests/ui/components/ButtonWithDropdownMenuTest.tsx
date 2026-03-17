import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';
import React from 'react';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';

describe('ButtonWithDropdownMenu (single option)', () => {
    const mockOnSelected = jest.fn();
    const mockOnOptionSelected = jest.fn();
    const mockOnSubItemSelected = jest.fn();
    const mockOnPress = jest.fn();
    const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Checkbox']));
    const option = {
        value: 'test',
        text: 'Test Option',
        icon: icons.current.Checkbox,
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

describe('ButtonWithDropdownMenu (dropdown arrow flip)', () => {
    const mockOnPress = jest.fn();
    const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Checkbox']));
    const options = [
        {value: 'one', text: 'Option One', icon: icons.current.Checkbox},
        {value: 'two', text: 'Option Two', icon: icons.current.Checkbox},
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('flips the arrow icon when the dropdown menu is opened in split button mode', () => {
        render(
            <ButtonWithDropdownMenu
                options={options}
                onPress={mockOnPress}
                isSplitButton
            />,
        );

        const arrowIcon = screen.getByTestId('dropdown-arrow-icon', {includeHiddenElements: true});
        expect(arrowIcon).not.toHaveStyle({transform: 'rotate(180deg)'});

        const buttons = screen.getAllByRole('button');
        const buttonToPress = buttons?.at(1);
        if (buttonToPress) {
            fireEvent.press(buttonToPress);
        }
        expect(arrowIcon).toHaveStyle({transform: 'rotate(180deg)'});
    });

    it('reverts the arrow icon when the dropdown menu is closed', () => {
        render(
            <ButtonWithDropdownMenu
                options={options}
                onPress={mockOnPress}
                isSplitButton
            />,
        );

        const arrowIcon = screen.getByTestId('dropdown-arrow-icon', {includeHiddenElements: true});
        const buttons = screen.getAllByRole('button');
        const buttonToPress = buttons?.at(1);
        if (buttonToPress) {
            fireEvent.press(buttonToPress);
        }
        expect(arrowIcon).toHaveStyle({transform: 'rotate(180deg)'});

        if (buttonToPress) {
            fireEvent.press(buttonToPress);
        }
        expect(arrowIcon).not.toHaveStyle({transform: 'rotate(180deg)'});
    });
});
