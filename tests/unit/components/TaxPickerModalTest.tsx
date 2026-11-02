import {fireEvent, render, screen} from '@testing-library/react-native';

import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type {TaxPickerProps} from '@components/TaxPicker';
import TaxPickerModal from '@components/TaxPicker/TaxPickerModal';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight, {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
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

const WINDOW_HEIGHT = 500;
let mockWindowHeight = WINDOW_HEIGHT;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

// The keyboard is closed by default. A test can open it to cover the sheet sitting above it.
let mockKeyboardHeight = 0;
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: mockKeyboardHeight > 0, keyboardActiveHeight: mockKeyboardHeight})));

let mockIsTablet = false;
jest.mock('@libs/isTablet', () => jest.fn(() => mockIsTablet));

// The home indicator area the sheet pads itself above, and no top inset.
const SAFE_AREA_PADDING_BOTTOM = 34;
jest.mock('@hooks/useSafeAreaPaddings', () => jest.fn(() => ({paddingTop: 0, paddingBottom: SAFE_AREA_PADDING_BOTTOM})));

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// The list itself is covered elsewhere; here only what the modal hands it, and what it does with a pick, matter.
let mockTaxPickerProps: TaxPickerProps | undefined;
jest.mock('@components/TaxPicker', () => (props: TaxPickerProps) => {
    mockTaxPickerProps = props;
    return null;
});

let mockPopoverProps: PopoverWithMeasuredContentProps | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => (props: PopoverWithMeasuredContentProps) => {
    mockPopoverProps = props;
    return props.children;
});

const POLICY_ID = 'policy1';
const TRANSACTION_ID = 'txn1';
const STANDARD_TAX_CODE = 'id_TAX_RATE_1';
const REDUCED_TAX_CODE = 'id_TAX_RATE_2';

const policy: Policy = {
    ...createRandomPolicy(1),
    id: POLICY_ID,
    taxRates: {
        name: 'VAT',
        defaultExternalID: STANDARD_TAX_CODE,
        defaultValue: '5%',
        foreignTaxDefault: STANDARD_TAX_CODE,
        taxes: {
            [STANDARD_TAX_CODE]: {name: 'Standard', value: '5%'},
            [REDUCED_TAX_CODE]: {name: 'Reduced', value: '10%'},
        },
    },
};

describe('TaxPickerModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPopoverProps = undefined;
        mockTaxPickerProps = undefined;
        mockIsSmallScreenWidth = true;
        mockIsInLandscapeMode = false;
        mockKeyboardHeight = 0;
        mockIsTablet = false;
        mockWindowHeight = WINDOW_HEIGHT;
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
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

        // When the tax rate list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the sheet fits the window, rises above the keyboard, and follows the visual viewport on a mobile browser,
        // the same way the category and tag sheets do
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(expectedHeight);
        expect(mockPopoverProps?.avoidKeyboard).toBe(true);
        expect(mockPopoverProps?.outerStyle).toEqual({width: '100%', maxHeight: mockWindowHeight, marginTop: mockViewportOffsetTop});
    });

    it('hands the list the expense it picks for', () => {
        // Given the expense form's tax rate row for a draft expense at the standard rate
        // When the list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                transactionID={TRANSACTION_ID}
                selectedTaxRate="Standard (5%)"
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the list reads that expense's draft, marks its current rate, and focuses its search input as the other anchored lists do
        expect(mockTaxPickerProps?.policyID).toBe(POLICY_ID);
        expect(mockTaxPickerProps?.transactionID).toBe(TRANSACTION_ID);
        expect(mockTaxPickerProps?.selectedTaxRate).toBe('Standard (5%)');
        expect(mockTaxPickerProps?.action).toBe(CONST.IOU.ACTION.CREATE);
        expect(mockTaxPickerProps?.iouType).toBe(CONST.IOU.TYPE.SUBMIT);
        expect(mockTaxPickerProps?.shouldAutoFocusSearchInput).toBe(true);
    });

    it('saves a pick and closes', () => {
        // Given the open list
        const onClose = jest.fn();
        const onSelected = jest.fn();
        render(
            <TaxPickerModal
                isVisible
                onClose={onClose}
                onSelected={onSelected}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // When a rate is picked
        const reducedRate = {code: REDUCED_TAX_CODE, keyForList: 'Reduced (10%)-1', text: 'Reduced (10%)'};
        mockTaxPickerProps?.onSubmit(reducedRate, false);

        // Then the pick is handed on and the list closes, as a single-select container does
        expect(onSelected).toHaveBeenCalledWith(reducedRate, false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('only closes when the current rate is picked again', () => {
        // Given the open list
        const onClose = jest.fn();
        const onSelected = jest.fn();
        render(
            <TaxPickerModal
                isVisible
                onClose={onClose}
                onSelected={onSelected}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // When the list dismisses itself, which it does for a tap on the rate the expense already has
        mockTaxPickerProps?.onDismiss();

        // Then nothing is written and the list closes, the same as the full-page selector going back
        expect(onSelected).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('fills the screen on a phone in landscape, however short the list', () => {
        // Given a phone in landscape and a workspace with two rates, whose sheet would otherwise fit those rows
        mockIsInLandscapeMode = true;

        // When the expense form's tax rate list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                shouldFitContentHeight
            />,
        );

        // Then the sheet fills the window up to the status bar, which the test harness reports as zero, less its own top
        // padding, and the modal neither caps nor wraps it, so the list scrolls on its own
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        expect(mockPopoverProps?.shouldLimitHeightIfBottomDockedInLandscapeMode).toBe(false);
        expect(mockPopoverProps?.shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode).toBe(false);
    });

    it('fits the sheet to a short list of rates', () => {
        // Given a phone, and a workspace with two rates
        // When the expense form's tax rate list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                shouldFitContentHeight
            />,
        );

        // Then the sheet is two rows tall plus the bottom safe area, leaving no empty space below the rates
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(getSelectionListPopoverContentHeight({optionCount: 2, isSearchable: false}) + SAFE_AREA_PADDING_BOTTOM);
    });

    describe('with eleven rates, one short of the search threshold, on a window tall enough for all of them', () => {
        const ELEVEN_ROWS_HEIGHT = getSelectionListPopoverContentHeight({optionCount: 11, isSearchable: false}) + SAFE_AREA_PADDING_BOTTOM;

        beforeEach(async () => {
            mockWindowHeight = 900;
            const taxes = Object.fromEntries(Array.from({length: 11}, (_, index) => [`id_TAX_RATE_${index}`, {name: `Tax ${index}`, value: `${index}%`}]));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {taxRates: {taxes}});
            await waitForBatchedUpdates();
        });

        it('fits all eleven rows on a phone', () => {
            // Given a phone, where the eleven rows are taller than the wide-layout dropdown cap but fit in the window
            expect(ELEVEN_ROWS_HEIGHT).toBeGreaterThan(CONST.POPOVER_DROPDOWN_MAX_HEIGHT);

            // When the expense form's tax rate list opens
            render(
                <TaxPickerModal
                    isVisible
                    onClose={jest.fn()}
                    policyID={POLICY_ID}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    shouldFitContentHeight
                />,
            );

            // Then the sheet is exactly as tall as its rows, instead of stopping at the five rows of the dropdown cap and leaving
            // the rest to scroll
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ELEVEN_ROWS_HEIGHT);
        });

        it('keeps the dropdown cap on a tablet', () => {
            // Given a tablet, whose window is tall enough for the dropdown cap to look right
            mockIsTablet = true;
            const dropdownCapHeight = getBottomSheetHeight({
                preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
                windowHeight: mockWindowHeight,
                keyboardHeight: 0,
                topSafeAreaInset: 0,
                minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable: false}),
            });

            // When the expense form's tax rate list opens
            render(
                <TaxPickerModal
                    isVisible
                    onClose={jest.fn()}
                    policyID={POLICY_ID}
                    anchorPosition={{horizontal: 0, vertical: 0}}
                    shouldFitContentHeight
                />,
            );

            // Then the sheet stops at the dropdown cap rather than taking most of the screen
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(dropdownCapHeight);
        });
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

        // When the tax rate list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then the sheet shrinks to the room the keyboard leaves and rises above it, so no rate sits behind the keyboard
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(expectedHeight);
        expect(mockPopoverProps?.avoidKeyboard).toBe(true);
    });

    it('shows a wide-layout pop-over of the standard size by default', () => {
        // Given a wide layout and a caller that passes no size of its own
        mockIsSmallScreenWidth = false;

        // When the tax rate list opens
        render(
            <TaxPickerModal
                isVisible
                onClose={jest.fn()}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
            />,
        );

        // Then it is the standard-size pop-over that may flip when it overflows, the same as the category and tag pop-overs
        expect(mockPopoverProps?.popoverDimensions).toEqual({width: CONST.POPOVER_DROPDOWN_WIDTH, height: CONST.POPOVER_DROPDOWN_MAX_HEIGHT});
        expect(mockPopoverProps?.shouldSwitchPositionIfOverflow).toBe(true);
    });

    it("shows a header with the tax's name whose back button closes the list", () => {
        // Given the expense form's tax rate row on a phone
        const onClose = jest.fn();
        render(
            <TaxPickerModal
                isVisible
                onClose={onClose}
                policyID={POLICY_ID}
                anchorPosition={{horizontal: 0, vertical: 0}}
                shouldShowHeader
            />,
        );

        // When the back button in its header is pressed
        expect(screen.getByText('VAT')).toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText('common.back'));

        // Then the list closes
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('leaves out the header by default', () => {
        // Given a caller that does not ask for a header
        // When the tax rate list opens
        render(
            <TaxPickerModal
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
