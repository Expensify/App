import {fireEvent, render, renderHook, screen, waitFor} from '@testing-library/react-native';

import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import HeaderWithBackButton from '@components/HeaderWithBackButton';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import * as usePopoverPositionModule from '@hooks/usePopoverPosition';
import * as useWindowDimensionsModule from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

import React from 'react';

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

describe('ButtonWithDropdownMenu in a responsive header', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('stays open and keeps its action when moved to a separate line', () => {
        const onSelected = jest.fn();
        const options = [{value: 'action', text: 'Responsive action', onSelected, shouldCloseModalOnSelect: false}];
        const renderHeader = (shouldDisplayResponsiveChildrenInSeparateLine: boolean) => (
            <HeaderWithBackButton
                title="Responsive header"
                shouldShowBackButton={false}
                shouldDisplayResponsiveChildrenInSeparateLine={shouldDisplayResponsiveChildrenInSeparateLine}
                responsiveChildren={
                    <ButtonWithDropdownMenu
                        options={options}
                        onPress={() => {}}
                        customText="More"
                        shouldAlwaysShowDropdownMenu
                        isSplitButton={false}
                    />
                }
            />
        );
        const {rerender} = render(renderHeader(false));

        fireEvent.press(screen.getByText('More'));
        expect(screen.getByText('Responsive action')).toBeOnTheScreen();

        rerender(renderHeader(true));
        expect(screen.getByText('Responsive action')).toBeOnTheScreen();

        const menuItem = screen.getByTestId('PopoverMenuItem-Responsive action');
        fireEvent.press(menuItem, {
            nativeEvent: {},
            type: 'press',
            target: menuItem,
            currentTarget: menuItem,
        });
        expect(onSelected).toHaveBeenCalledTimes(1);
    });

    it('remeasures an open menu when the window dimensions change', async () => {
        const calculatePopoverPosition = jest.fn().mockResolvedValue({horizontal: 100, vertical: 100, width: 40, height: 40});
        let windowDimensions = {windowWidth: 800, windowHeight: 600};
        jest.spyOn(usePopoverPositionModule, 'default').mockReturnValue({calculatePopoverPosition});
        jest.spyOn(useWindowDimensionsModule, 'default').mockImplementation(() => windowDimensions);
        const renderDropdown = () => (
            <ButtonWithDropdownMenu
                options={[{value: 'action', text: 'Responsive action'}]}
                onPress={() => {}}
                customText="More"
                shouldAlwaysShowDropdownMenu
                isSplitButton={false}
            />
        );
        const {rerender} = render(renderDropdown());

        fireEvent.press(screen.getByText('More'));
        await waitFor(() => expect(calculatePopoverPosition).toHaveBeenCalledTimes(1));

        windowDimensions = {windowWidth: 600, windowHeight: 800};
        rerender(renderDropdown());

        await waitFor(() => expect(calculatePopoverPosition).toHaveBeenCalledTimes(2));
    });
});
