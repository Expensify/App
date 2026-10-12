import {fireEvent, render, screen} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// Only mobile browsers dock the sheet behind the keyboard, so the tests flip this to cover both.
let mockIsMobileBrowser = true;
jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof Browser>('@libs/Browser'),
    isMobile: () => mockIsMobileBrowser,
}));

// A phone-width window, where the pop-over is the bottom sheet these tests are about.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: true, shouldUseNarrowLayout: true})));

// The window as a mobile browser reports it with the keyboard open: shorter, and panned down past the page top.
const mockWindowHeight = 500;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

// The list is covered by CategoryPickerTest; here only the sheet around it and its header matter.
jest.mock('@components/CategoryPicker', () => () => null);

// Records what the sheet is handed and renders its content, so both the container props and the header can be checked.
let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

describe('CategoryPickerModal', () => {
    beforeEach(() => {
        mockPopoverProps = undefined;
        mockIsMobileBrowser = true;
    });

    const renderSheet = (onAddCategory?: () => void) =>
        render(
            <CategoryPickerModal
                isVisible
                onClose={jest.fn()}
                policyID="1"
                anchorPosition={{horizontal: 0, vertical: 0}}
                onAddCategory={onAddCategory}
            />,
        );

    it('shows an add button that adds a category for users who can create one', () => {
        // Given a user who can add categories to the workspace, as the full-page selector's "+" allows
        const onAddCategory = jest.fn();
        renderSheet(onAddCategory);
        expect(screen.getByText('common.category')).toBeOnTheScreen();

        // When they press the add button in the pop-over's header
        fireEvent.press(screen.getByLabelText('workspace.categories.addCategory'));

        // Then the pop-over hands over to the add-category flow, so the pop-over offers the same action the full page does
        expect(onAddCategory).toHaveBeenCalledTimes(1);
    });

    it('shows no header for users who cannot create a category', () => {
        // Given a user who cannot add categories, e.g. a member or a workspace synced with an accounting integration
        // When the pop-over opens
        renderSheet();

        // Then there is no add button or header, matching the full page that hides its "+" for them
        expect(screen.queryByLabelText('workspace.categories.addCategory')).toBeNull();
        expect(screen.queryByText('common.category')).toBeNull();
    });

    it('docks the sheet to the visual viewport on a mobile browser', () => {
        // Given a mobile browser whose keyboard shrank and panned the visual viewport, which the bottom-docked modal
        // otherwise ignores because it is docked to the layout viewport the keyboard covers

        // When the picker opens as a bottom sheet
        renderSheet();

        // Then the sheet is capped to the visual viewport's height and pushed down by its offset, so it sits above the keyboard
        expect(mockPopoverProps?.outerStyle).toEqual({width: '100%', maxHeight: mockWindowHeight, marginTop: mockViewportOffsetTop});
    });

    it('keeps the plain full-width sheet off mobile browsers', () => {
        // Given a narrow window outside a mobile browser: native lifts the sheet with avoidKeyboard, and a desktop window has no keyboard to clear
        mockIsMobileBrowser = false;

        // When the picker opens as a bottom sheet
        renderSheet();

        // Then nothing is added for the visual viewport
        expect(mockPopoverProps?.outerStyle).toEqual({width: '100%'});
    });

    it('hands the native sheet its keyboard handling and a height that fits the window', () => {
        // Given a phone whose keyboard is closed and whose safe area insets are zero, as the test harness reports them,
        // with no categories loaded, so the list has no search input
        const expectedHeight = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight: mockWindowHeight,
            keyboardHeight: 0,
            topSafeAreaInset: 0,
            minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}),
        });

        // When the picker opens as a bottom sheet
        renderSheet();

        // Then the sheet is sized for that window and lifts above the keyboard
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(expectedHeight);
        expect(mockPopoverProps?.avoidKeyboard).toBe(true);
    });
});
