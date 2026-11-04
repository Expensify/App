import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';
import type {TagPickerProps} from '@components/TagPicker';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import useThemeStyles from '@hooks/useThemeStyles';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight, {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof Browser>('@libs/Browser'),
    isMobile: () => true,
}));

let mockIsSmallScreenWidth = true;
let mockIsInLandscapeMode = false;
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth, isInLandscapeMode: mockIsInLandscapeMode})),
);

const mockWindowHeight = 500;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

// The keyboard is closed by default. A test can open it to cover the sheet sitting above it.
let mockKeyboardHeight = 0;
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: mockKeyboardHeight > 0, keyboardActiveHeight: mockKeyboardHeight})));

// The home indicator area the sheet pads itself above, and no top inset.
const SAFE_AREA_PADDING_BOTTOM = 34;
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingTop: 0, paddingBottom: SAFE_AREA_PADDING_BOTTOM})));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// The list itself is covered elsewhere; here only what the modal hands it matters.
let mockTagPickerProps: TagPickerProps | undefined;
jest.mock('@components/TagPicker', () => (props: TagPickerProps) => {
    mockTagPickerProps = props;
    return null;
});

let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

const POLICY_ID = 'policy1';

const policyTags: PolicyTagLists = {
    Department: {name: 'Department', orderWeight: 0, required: false, tags: {Engineering: {name: 'Engineering', enabled: true}}},
    Project: {name: 'Project', orderWeight: 1, required: false, tags: {Alpha: {name: 'Alpha', enabled: true}}},
};

describe('TagPickerModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPopoverProps = undefined;
        mockTagPickerProps = undefined;
        mockIsSmallScreenWidth = true;
        mockIsInLandscapeMode = false;
        mockKeyboardHeight = 0;
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, policyTags);
        await waitForBatchedUpdates();
    });

    it('shows a phone-sized bottom sheet that clears the keyboard', () => {
        // Given a phone, where the list opens as a bottom sheet, with the keyboard closed and no safe area insets in the test harness
        const expectedHeight = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight: mockWindowHeight,
            keyboardHeight: 0,
            topSafeAreaInset: 0,
            minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}),
        });

        // When the tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the sheet fits the window, rises above the keyboard, and follows the visual viewport on a mobile browser,
        // the same way the category sheet does
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(expectedHeight);
        expect(mockPopoverProps?.avoidKeyboard).toBe(true);
        expect(mockPopoverProps?.outerStyle).toEqual({width: '100%', maxHeight: mockWindowHeight, marginTop: mockViewportOffsetTop});
    });

    it('shows the tag list it is given', () => {
        // Given a row for the second tag list
        // When that row's list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                tagListIndex={1}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the list shows the second list's tags under its own name
        expect(mockTagPickerProps?.tagListIndex).toBe(1);
        expect(mockTagPickerProps?.tagListName).toBe('Project');
    });

    it('hands the list the search threshold it is given', () => {
        // Given a caller with its own threshold for the search input, like the Search table's tag cell
        // When the tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                searchInputThreshold={CONST.INLINE_EDIT_PICKER_SEARCH_INPUT_THRESHOLD}
            />,
        );

        // Then the list shows its search input at that threshold rather than the standard one
        expect(mockTagPickerProps?.searchInputThreshold).toBe(CONST.INLINE_EDIT_PICKER_SEARCH_INPUT_THRESHOLD);
    });

    it('fills the screen on a phone in landscape, however short the list', () => {
        // Given a phone in landscape and a tag list with a single tag, whose sheet would otherwise fit that one row
        mockIsInLandscapeMode = true;

        // When the expense form's tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                shouldFitContentHeight
            />,
        );

        // Then the sheet fills the window up to the status bar, which the test harness reports as zero, less its own top
        // padding, the same as the category sheet, and the modal neither caps nor wraps it, so the list scrolls on its own
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        expect(mockPopoverProps?.shouldLimitHeightIfBottomDockedInLandscapeMode).toBe(false);
        expect(mockPopoverProps?.shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode).toBe(false);
    });

    it("keeps the Search table cell's pop-over unchanged by default", () => {
        // Given a wide layout and a caller that passes none of the new props, like the Search table's tag cell
        mockIsSmallScreenWidth = false;

        // When the tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then it still shows the first list in the standard-size pop-over that may flip when it overflows
        expect(mockTagPickerProps?.tagListIndex).toBe(0);
        expect(mockPopoverProps?.popoverDimensions).toEqual({width: CONST.POPOVER_DROPDOWN_WIDTH, height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT});
        expect(mockPopoverProps?.shouldSwitchPositionIfOverflow).toBe(true);
    });

    it('fits the sheet to a short tag list', () => {
        // Given a phone, and a tag list with a single tag
        // When the expense form's tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                shouldFitContentHeight
            />,
        );

        // Then the sheet is one row tall plus the bottom safe area, the same as the category sheet, leaving no empty space below the row
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}) + SAFE_AREA_PADDING_BOTTOM);
    });

    it('keeps the sheet above an open keyboard', () => {
        // Given a phone whose keyboard is open
        mockKeyboardHeight = 300;
        const expectedHeight = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight: mockWindowHeight,
            keyboardHeight: mockKeyboardHeight,
            topSafeAreaInset: 0,
            minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}),
        });

        // When the tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the sheet shrinks to the room the keyboard leaves and rises above it, so no tag sits behind the keyboard
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(expectedHeight);
        expect(mockPopoverProps?.avoidKeyboard).toBe(true);
    });

    it("shows a header with the tag list's name whose back button closes the list", () => {
        // Given the expense form's row for the second tag list
        const onClose = jest.fn();
        render(
            <TagPickerModal
                isVisible
                onClose={onClose}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                tagListIndex={1}
                shouldShowHeader
                shouldFitContentHeight
            />,
        );

        // When the back button in its header is pressed
        expect(screen.getByText('Project')).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the list closes, and the sheet had grown by the header, less the list's top padding the sheet's own padding
        // replaces under a header, so it still fits the list's one row
        expect(onClose).toHaveBeenCalledTimes(1);
        const {result: styles} = renderHook(() => useThemeStyles());
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(
            getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}) + SELECTION_LIST_POPOVER_HEADER_HEIGHT - styles.current.pt4.paddingTop + SAFE_AREA_PADDING_BOTTOM,
        );
    });

    it('shows the header without a back button on a wide layout', () => {
        // Given a wide layout, where the list opens as a pop-over the user dismisses by clicking outside it
        mockIsSmallScreenWidth = false;

        // When the expense form's tag list opens with its header
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                tagListIndex={1}
                shouldShowHeader
            />,
        );

        // Then the header names the list but has no back button, as the category pop-over does
        expect(screen.getByText('Project')).toBeOnTheScreen();
        expect(screen.queryByLabelText('common.back')).not.toBeOnTheScreen();
    });

    it('leaves out the header by default', () => {
        // Given a caller that does not ask for a header, like the Search table's tag cell
        // When the tag list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then there is no back button
        expect(screen.queryByLabelText('common.back')).not.toBeOnTheScreen();
    });
});
