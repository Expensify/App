import {fireEvent, render, screen} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// Only mobile browsers dock the sheet behind the keyboard, so the tests flip this to cover both.
let mockIsMobileBrowser = true;
jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof Browser>('@libs/Browser'),
    isMobile: () => mockIsMobileBrowser,
}));

// A phone-width window by default, where the pop-over is a bottom sheet. A test can widen it to get the pop-over.
let mockIsSmallScreenWidth = true;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));

// The window as a mobile browser reports it with the keyboard open: shorter, and panned down past the page top.
const mockWindowHeight = 500;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

// The keyboard is closed by default. A test can open it to cover the sheet sitting above it.
let mockKeyboardHeight = 0;
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: mockKeyboardHeight > 0, keyboardActiveHeight: mockKeyboardHeight})));

// The home indicator area the sheet pads itself above, and no top inset, as the test harness reports it.
const SAFE_AREA_PADDING_BOTTOM = 34;
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingTop: 0, paddingBottom: SAFE_AREA_PADDING_BOTTOM})));

// The list is covered by CategoryPickerTest; here only the sheet around it and its header matter.
jest.mock('@components/CategoryPicker', () => () => null);

// Records what the sheet is handed and renders its content, so both the container props and the header can be checked.
let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

const POLICY_ID = 'policyID';

describe('CategoryPickerModal', () => {
    beforeEach(() => {
        mockPopoverProps = undefined;
        mockIsMobileBrowser = true;
        mockIsSmallScreenWidth = true;
        mockKeyboardHeight = 0;
    });

    const renderSheet = ({onAddCategory, onClose = jest.fn(), shouldFitContentHeight = false}: {onAddCategory?: () => void; onClose?: () => void; shouldFitContentHeight?: boolean} = {}) =>
        render(
            <CategoryPickerModal
                isVisible
                onClose={onClose}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                onAddCategory={onAddCategory}
                shouldFitContentHeight={shouldFitContentHeight}
            />,
        );

    it('shows an add button that adds a category for users who can create one', () => {
        // Given a user who can add categories to the workspace, as the full-page selector's "+" allows
        const onAddCategory = jest.fn();
        renderSheet({onAddCategory});
        expect(screen.getByText('common.category')).toBeOnTheScreen();

        // When they press the add button in the pop-over's header
        fireEvent.press(screen.getByLabelText('workspace.categories.addCategory'));

        // Then the pop-over hands over to the add-category flow, so the pop-over offers the same action the full page does
        expect(onAddCategory).toHaveBeenCalledTimes(1);
    });

    it('closes the pop-over from the back button in its header', () => {
        // Given the pop-over showing its header, for a user who can add categories
        const onClose = jest.fn();
        const onAddCategory = jest.fn();
        renderSheet({onAddCategory, onClose});

        // When they press the back button on the top left of the header
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the pop-over closes without starting the add-category flow, like the full page's back button leaves the step
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onAddCategory).not.toHaveBeenCalled();
    });

    it('shows no header for users who cannot create a category', () => {
        // Given a user who cannot add categories, e.g. a member or a workspace synced with an accounting integration
        // When the pop-over opens
        renderSheet();

        // Then there is no back button, add button or header, matching the full page that hides its "+" for them
        expect(screen.queryByLabelText('workspace.categories.addCategory')).toBeNull();
        expect(screen.queryByLabelText('common.back')).toBeNull();
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

    it('keeps the landscape sheet from wrapping its content in a scroll view', () => {
        // Given a bottom sheet with its header buttons, which the modal would wrap in a ScrollView in landscape. That
        // ScrollView makes the first tap with the keyboard open only dismiss it, so "+" would need a second tap
        renderSheet({onAddCategory: jest.fn()});

        // When the picker opens
        // Then it opts out of the wrapper, since the sheet is already sized to fit and its list scrolls itself
        expect(mockPopoverProps?.shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode).toBe(false);
    });

    it('hands the native sheet its keyboard handling and a height that fits the window', () => {
        // Given a phone whose keyboard is closed and whose top safe area inset is zero, as the test harness reports it,
        // with no categories loaded, so the list has no search input, and a caller that does not fit the list to its content
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

    describe('with a short list', () => {
        const ONE_ROW_HEIGHT = getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false});

        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Travel: {name: 'Travel', enabled: true}});
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('fits the bottom sheet to the list instead of opening at the window height', async () => {
            // Given a phone, where the list opens as a bottom sheet, and a workspace with a single category
            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet is one row tall plus the bottom safe area it pads itself with, leaving no empty space below the row
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT + SAFE_AREA_PADDING_BOTTOM);
        });

        it('fits the pop-over to the list without any bottom safe area', async () => {
            // Given a wide layout, where the list opens as a pop-over that never reaches the bottom safe area
            mockIsSmallScreenWidth = false;

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the pop-over is exactly one row tall
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT);
        });

        it('drops the bottom safe area from a fitted sheet while the keyboard is open', async () => {
            // Given a phone whose keyboard is open and covers the home indicator, leaving more than a row of room above it
            mockKeyboardHeight = 200;

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet is exactly one row tall, with no padding for a home indicator the keyboard already hides
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT);
        });
    });

    describe('with a long list', () => {
        const CATEGORY_COUNT = 6;

        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`,
                Object.fromEntries(Array.from({length: CATEGORY_COUNT}, (_, index) => [`Category${index}`, {name: `Category${index}`, enabled: true}])),
            );
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('caps a fitted sheet at the height the window leaves', async () => {
            // Given a phone and a workspace with enough categories that the rows plus the bottom safe area are taller than the window allows
            const windowCap = getBottomSheetHeight({
                preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
                windowHeight: mockWindowHeight,
                keyboardHeight: 0,
                topSafeAreaInset: 0,
                minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}),
            });
            expect(getSelectionListPopoverContentHeight({optionCount: CATEGORY_COUNT, isSearchable: false}) + SAFE_AREA_PADDING_BOTTOM).toBeGreaterThan(windowCap);

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet stops at the window cap instead of growing to fit every row and running off the screen
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(windowCap);
        });
    });
});
