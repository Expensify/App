import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import CategoryPickerModal, {CATEGORY_PICKER_HEADER_HEIGHT} from '@components/CategoryPicker/CategoryPickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type * as Browser from '@libs/Browser';
import getBottomSheetHeight, {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {Dimensions} from 'react-native';
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
let mockIsInLandscapeMode = false;
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({isSmallScreenWidth: mockIsSmallScreenWidth, shouldUseNarrowLayout: mockIsSmallScreenWidth, isInLandscapeMode: mockIsInLandscapeMode})),
);

// The window as a mobile browser reports it with the keyboard open: shorter, and panned down past the page top.
const WINDOW_HEIGHT = 500;
let mockWindowHeight = WINDOW_HEIGHT;
const mockViewportOffsetTop = 40;
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 390, windowHeight: mockWindowHeight})));
jest.mock('@hooks/useViewportOffsetTop', () => jest.fn(() => mockViewportOffsetTop));

// The keyboard is closed by default. A test can open it to cover the sheet sitting above it.
let mockKeyboardHeight = 0;
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: mockKeyboardHeight > 0, keyboardActiveHeight: mockKeyboardHeight})));

// A phone by default. A test can make it a tablet, which keeps the regular sheet.
let mockIsTablet = false;
jest.mock('@libs/isTablet', () => jest.fn(() => mockIsTablet));

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
        mockIsInLandscapeMode = false;
        mockKeyboardHeight = 0;
        mockWindowHeight = WINDOW_HEIGHT;
        mockIsTablet = false;
    });

    type SheetProps = {onAddCategory?: () => void; onClose?: () => void; shouldFitContentHeight?: boolean};

    const getSheet = ({onAddCategory, onClose = jest.fn(), shouldFitContentHeight = false}: SheetProps) => (
        <CategoryPickerModal
            isVisible
            onClose={onClose}
            policyID={POLICY_ID}
            anchorPosition={{horizontal: 0, vertical: 0}}
            onAddCategory={onAddCategory}
            shouldFitContentHeight={shouldFitContentHeight}
        />
    );

    // `rerenderSheet` renders the same props again, e.g. after a test changes the keyboard or window it reads.
    const renderSheet = (props: SheetProps = {}) => {
        const result = render(getSheet(props));
        return {...result, rerenderSheet: () => result.rerender(getSheet(props))};
    };

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

    it('leaves the back button out of the wide pop-over', () => {
        // Given a wide layout, where the list opens as a pop-over that a click outside it already closes
        mockIsSmallScreenWidth = false;

        // When the pop-over opens with its header, for a user who can add categories
        renderSheet({onAddCategory: jest.fn()});

        // Then the header keeps its title and add button, but has no back button
        expect(screen.queryByLabelText('common.back')).toBeNull();
        expect(screen.getByText('common.category')).toBeOnTheScreen();
        expect(screen.getByLabelText('workspace.categories.addCategory')).toBeOnTheScreen();
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

    it('fills the screen with the sheet on a phone in landscape instead of handing over to a page', () => {
        // Given a phone turned to landscape, where a sheet over the form would leave too little room to scroll the list
        mockIsInLandscapeMode = true;

        // When the list opens, or is already open as the phone turns
        renderSheet();

        // Then the sheet stays up and fills the window up to the status bar, which the test harness reports as zero, less the
        // sheet's own top padding, and the modal neither caps nor wraps it, so the list scrolls all the way down on its own
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        expect(mockPopoverProps?.shouldLimitHeightIfBottomDockedInLandscapeMode).toBe(false);
        expect(mockPopoverProps?.shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode).toBe(false);
    });

    it('fits the full-screen sheet above the keyboard on a phone in landscape', () => {
        // Given a phone in landscape with the keyboard open, e.g. while searching the list
        mockIsInLandscapeMode = true;
        mockKeyboardHeight = 200;

        // When the list opens
        renderSheet();

        // Then the sheet fills only the room between the keyboard and the status bar, so the search input and the rows stay visible
        expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - mockKeyboardHeight - BOTTOM_SHEET_TOP_PADDING);
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

        it('still fills the screen on a phone in landscape', async () => {
            // Given a phone in landscape and a workspace with a single category, whose sheet would otherwise fit that one row
            mockIsInLandscapeMode = true;

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet fills the screen anyway, so turning the phone never leaves a sliver of a sheet over the form
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        });

        it('fits the bottom sheet to the list instead of opening at the window height', async () => {
            // Given a phone, where the list opens as a bottom sheet, and a workspace with a single category
            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet is one row tall plus the bottom safe area it pads itself with, leaving no empty space below the row
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT + SAFE_AREA_PADDING_BOTTOM);
        });

        it('keeps the header 20px from the top of the sheet, which already pads its own top', async () => {
            // Given a phone, and a user who can add categories, so the sheet shows a header above the single category
            // When the expense form's category list opens
            renderSheet({onAddCategory: jest.fn(), shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the list drops its own 16px top padding under the header, since the sheet's padding plus the header's 4px already make 20px
            const {result: styles} = renderHook(() => useThemeStyles());
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT + CATEGORY_PICKER_HEADER_HEIGHT - styles.current.pt4.paddingTop + SAFE_AREA_PADDING_BOTTOM);
        });

        it('keeps the list top padding above the header in the wide pop-over', async () => {
            // Given a wide layout, where the pop-over has no top padding of its own, and a user who can add categories
            mockIsSmallScreenWidth = false;

            // When the expense form's category list opens
            renderSheet({onAddCategory: jest.fn(), shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the pop-over is one row plus the header, whose 20px from the top comes from the list's padding
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(ONE_ROW_HEIGHT + CATEGORY_PICKER_HEADER_HEIGHT);
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

    describe('with a searchable list', () => {
        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`,
                Object.fromEntries(Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT}, (_, index) => [`Category${index}`, {name: `Category${index}`, enabled: true}])),
            );
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('opens as tall as a sheet may be on a phone, so opening the keyboard does not push the list up', async () => {
            // Given a phone in portrait and enough categories that the list shows its search input
            // When the expense form's category list opens, and then the search input brings up the keyboard
            const {rerenderSheet} = renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();
            const closedHeight = mockPopoverProps?.popoverDimensions?.height;
            mockKeyboardHeight = 200;
            rerenderSheet();

            // Then the sheet opens tall, leaving a gap above it rather than filling the window, and neither shrinks nor is lifted
            // when the keyboard opens, so its top edge and the list under it stay where they were. The room for the keyboard is
            // made inside it, in step with the keyboard's own animation.
            const topGap = Dimensions.get('screen').height * (1 - CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO);
            expect(closedHeight).toBe(mockWindowHeight - topGap - BOTTOM_SHEET_TOP_PADDING);
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(closedHeight);
            expect(mockPopoverProps?.avoidKeyboard).toBe(false);
        });

        it('loses only the keyboard height on mobile web, where the keyboard shrinks the window, so its top does not move', async () => {
            // Given a mobile browser in portrait, with enough categories that the list shows its search input
            const {rerenderSheet} = renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();
            const closedHeight = mockPopoverProps?.popoverDimensions?.height ?? 0;

            // When the search input brings up the keyboard, which on mobile web shrinks the window by its height
            const keyboardHeight = 200;
            mockWindowHeight = WINDOW_HEIGHT - keyboardHeight;
            rerenderSheet();

            // Then the sheet, docked to the bottom of that window, is shorter by exactly the keyboard, so its top edge stays where it was
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(closedHeight - keyboardHeight);
        });

        it('keeps the same keyboard handling when the phone turns, so the sheet is not remounted', async () => {
            // Given a phone in portrait with the searchable list open and the keyboard up for its search input
            mockKeyboardHeight = 200;
            const {rerenderSheet} = renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();
            expect(mockPopoverProps?.avoidKeyboard).toBe(false);

            // When the phone turns to landscape
            mockIsInLandscapeMode = true;
            rerenderSheet();

            // Then `avoidKeyboard` stays off, as flipping it swaps the modal's wrapper, which replays the sheet's entry animation and
            // drops the input's focus. The sheet fills the window and still makes the room for the keyboard inside itself
            expect(mockPopoverProps?.avoidKeyboard).toBe(false);
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(mockWindowHeight - BOTTOM_SHEET_TOP_PADDING);
        });

        it('keeps the regular sheet on a tablet, which never needs the phone keyboard handling', async () => {
            // Given a tablet, which shows the list as a bottom sheet natively but never turns into landscape mode here
            mockIsTablet = true;

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the sheet keeps the dropdown cap rather than taking most of the screen, and rises above the keyboard like other sheets
            const regularSheetHeight = getBottomSheetHeight({
                preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
                windowHeight: mockWindowHeight,
                keyboardHeight: 0,
                topSafeAreaInset: 0,
                minHeight: getSelectionListPopoverContentHeight({optionCount: 1}),
            });
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(regularSheetHeight);
            expect(mockPopoverProps?.avoidKeyboard).toBe(true);
        });

        it('keeps the wide pop-over at its own height', async () => {
            // Given a wide layout, where the list opens as a pop-over and no keyboard pushes it around
            mockIsSmallScreenWidth = false;

            // When the expense form's category list opens
            renderSheet({shouldFitContentHeight: true});
            await waitForBatchedUpdates();

            // Then the pop-over keeps the height it was given rather than filling the window
            expect(mockPopoverProps?.popoverDimensions?.height).toBe(CONST.POPOVER_DROPDOWN_MAX_HEIGHT);
        });
    });
});
