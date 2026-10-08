import getBottomSheetHeight, {BOTTOM_SHEET_TOP_PADDING} from '@libs/getBottomSheetHeight';

import CONST from '@src/CONST';

const MIN_HEIGHT = 150;
const TOP_INSET = 24;

describe('getBottomSheetHeight', () => {
    it('keeps the preferred height when a tall portrait window has room for it', () => {
        // Given a tall portrait phone with the keyboard closed
        // When the sheet asks for the standard dropdown height
        const height = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight: 900,
            isInLandscapeMode: false,
            keyboardHeight: 0,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
        });

        // Then it gets that height less the sheet's top padding, which sits outside the content
        expect(height).toBe(CONST.POPOVER_DROPDOWN_MAX_HEIGHT - BOTTOM_SHEET_TOP_PADDING);
    });

    it('caps the sheet to a smaller share of the window in landscape', () => {
        // Given a landscape phone, whose window is too short for the standard dropdown height
        const windowHeight = 400;

        // When the sheet asks for the standard dropdown height
        const height = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight,
            isInLandscapeMode: true,
            keyboardHeight: 0,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
        });

        // Then it takes only the landscape share of the window, so it never runs off the top of the screen
        expect(height).toBe(windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE - BOTTOM_SHEET_TOP_PADDING);
    });

    it('fits between the keyboard and the status bar while the keyboard is open', () => {
        // Given a portrait phone whose keyboard leaves less room than the sheet wants
        const windowHeight = 700;
        const keyboardHeight = 320;

        // When the sheet is raised above the keyboard
        const height = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight,
            isInLandscapeMode: false,
            keyboardHeight,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
        });

        // Then it shrinks to the room left, so its top stays below the status bar
        expect(height).toBe(windowHeight - keyboardHeight - TOP_INSET - BOTTOM_SHEET_TOP_PADDING);
    });

    it('never collapses below one usable row when the keyboard leaves almost no room', () => {
        // Given a tiny window, e.g. Android split screen, where the keyboard leaves no room at all
        // When the sheet is raised above the keyboard
        const height = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight: 300,
            isInLandscapeMode: false,
            keyboardHeight: 260,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
        });

        // Then it keeps the minimum height, so the search input and a row stay visible instead of the sheet collapsing
        expect(height).toBe(MIN_HEIGHT);
    });

    it('never lets the minimum height push the sheet past its own cap', () => {
        // Given a landscape window so short that its share of the screen is below the minimum height
        const windowHeight = 200;
        const cappedHeight = windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE - BOTTOM_SHEET_TOP_PADDING;
        expect(cappedHeight).toBeLessThan(MIN_HEIGHT);

        const height = getBottomSheetHeight({
            preferredHeight: CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
            windowHeight,
            isInLandscapeMode: true,
            keyboardHeight: 120,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
        });

        expect(height).toBe(cappedHeight);
    });

    it('caps at the height it is handed instead of the dropdown cap', () => {
        const maxHeight = 600;

        // When the sheet asks for more than that
        const height = getBottomSheetHeight({
            preferredHeight: 700,
            windowHeight: 900,
            isInLandscapeMode: false,
            keyboardHeight: 0,
            topSafeAreaInset: TOP_INSET,
            minHeight: MIN_HEIGHT,
            maxHeight,
        });

        expect(height).toBe(maxHeight - BOTTOM_SHEET_TOP_PADDING);
    });
});
