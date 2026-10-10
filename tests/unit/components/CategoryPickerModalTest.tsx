import {render} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';

import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = 'policyID';
const SAFE_AREA_PADDING_BOTTOM = 34;
const ONE_ROW_HEIGHT = getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false});

let mockIsSmallScreenWidth = true;
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth})));
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingBottom: SAFE_AREA_PADDING_BOTTOM})));
jest.mock('@components/CategoryPicker', () => () => null);

let mockPopoverHeight: number | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => ({popoverDimensions}: {popoverDimensions: {height: number}}) => {
    mockPopoverHeight = popoverDimensions.height;
    return null;
});

const renderModal = (shouldFitContentHeight: boolean) =>
    render(
        <CategoryPickerModal
            isVisible
            onClose={() => {}}
            anchorPosition={{horizontal: 0, vertical: 0}}
            policyID={POLICY_ID}
            shouldFitContentHeight={shouldFitContentHeight}
        />,
    );

describe('CategoryPickerModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPopoverHeight = undefined;
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Travel: {name: 'Travel', enabled: true}});
        await waitForBatchedUpdates();
    });

    it('fits the bottom sheet to a short list instead of opening at the max height', async () => {
        // Given a phone, where the list opens as a bottom sheet, and a workspace with a single category
        mockIsSmallScreenWidth = true;

        // When the expense form's category list opens
        renderModal(true);
        await waitForBatchedUpdates();

        // Then the sheet is one row tall plus the bottom safe area it pads itself with, leaving no empty space below the row
        expect(mockPopoverHeight).toBe(ONE_ROW_HEIGHT + SAFE_AREA_PADDING_BOTTOM);
        expect(mockPopoverHeight).toBeLessThan(CONST.POPOVER_DROPDOWN_MAX_HEIGHT);
    });

    it('fits the pop-over to a short list without any bottom safe area', async () => {
        // Given a wide layout, where the list opens as a pop-over that never reaches the bottom safe area
        mockIsSmallScreenWidth = false;

        // When the expense form's category list opens
        renderModal(true);
        await waitForBatchedUpdates();

        // Then the pop-over is exactly one row tall
        expect(mockPopoverHeight).toBe(ONE_ROW_HEIGHT);
    });

    it('keeps the max height for callers that do not ask to fit the content', async () => {
        // Given a phone and a caller, like the Search table's category cell, that does not fit the list to its content
        mockIsSmallScreenWidth = true;

        // When the category list opens
        renderModal(false);
        await waitForBatchedUpdates();

        // Then the sheet keeps the max height, as before
        expect(mockPopoverHeight).toBe(CONST.POPOVER_DROPDOWN_MAX_HEIGHT);
    });
});
