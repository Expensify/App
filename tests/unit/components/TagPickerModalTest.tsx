import {render} from '@testing-library/react-native';

import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {TagPickerProps} from '@components/TagPicker';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight from '@libs/getBottomSheetHeight';
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
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));

const mockWindowHeight = 500;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

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

    it('shows the tag list it is given and hands its close callback to the pop-over', () => {
        // Given a row for the second tag list, which needs to know when its container has finished closing
        const onModalHide = jest.fn();

        // When that row's list opens
        render(
            <TagPickerModal
                isVisible
                onClose={jest.fn()}
                onModalHide={onModalHide}
                policyID={POLICY_ID}
                tagListIndex={1}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the list shows the second list's tags under its own name, and the pop-over reports back when it hides
        expect(mockTagPickerProps?.tagListIndex).toBe(1);
        expect(mockTagPickerProps?.tagListName).toBe('Project');
        expect(mockPopoverProps?.onModalHide).toBe(onModalHide);
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
});
