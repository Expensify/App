import {render} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';

import React from 'react';

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

// The list is covered by CategoryPickerTest; here only the sheet around it matters.
jest.mock('@components/CategoryPicker', () => () => null);

let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return null;
});

describe('CategoryPickerModal', () => {
    beforeEach(() => {
        mockPopoverProps = undefined;
        mockIsMobileBrowser = true;
    });

    const renderSheet = () =>
        render(
            <CategoryPickerModal
                isVisible
                onClose={jest.fn()}
                policyID="1"
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

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
