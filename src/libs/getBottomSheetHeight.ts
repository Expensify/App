import variables from '@styles/variables';

import CONST from '@src/CONST';

/** The bottom-docked modal's top padding (set in `ModalStyleUtils`), which sits outside the height its content is given */
const BOTTOM_SHEET_TOP_PADDING = variables.componentBorderRadiusLarge;

type BottomSheetHeightParams = {
    /** Height the content would like, before the screen caps it */
    preferredHeight: number;

    /** Height of the window the sheet opens in */
    windowHeight: number;

    /** Whether the device is in landscape, where a sheet may take less of the window */
    isInLandscapeMode: boolean;

    /** Height of the open keyboard, or 0 when it is closed */
    keyboardHeight: number;

    /** Top safe area inset, i.e. the status bar the sheet must stay below once raised above the keyboard */
    topSafeAreaInset: number;

    /** Least height the sheet keeps above the keyboard, so a short window still shows something to pick */
    minHeight: number;

    /** Tallest the sheet may be regardless of the window. Defaults to the dropdown cap, `CONST.POPOVER_DROPDOWN_MAX_HEIGHT` */
    maxHeight?: number;
};

/**
 * Height to give the content of a bottom sheet so it fits on screen: capped by `maxHeight` and by the window (less of
 * it in landscape), and, while the keyboard is open, by the room between the keyboard and the status bar. `minHeight`
 * never pushes the sheet past that cap.
 */
function getBottomSheetHeight({
    preferredHeight,
    windowHeight,
    isInLandscapeMode,
    keyboardHeight,
    topSafeAreaInset,
    minHeight,
    maxHeight = CONST.POPOVER_DROPDOWN_MAX_HEIGHT,
}: BottomSheetHeightParams): number {
    const heightRatio = isInLandscapeMode ? CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE : CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO;
    const cappedHeight = Math.min(preferredHeight, Math.min(maxHeight, windowHeight * heightRatio) - BOTTOM_SHEET_TOP_PADDING);

    if (!keyboardHeight) {
        return cappedHeight;
    }

    const heightAboveKeyboard = windowHeight - keyboardHeight - topSafeAreaInset - BOTTOM_SHEET_TOP_PADDING;
    return Math.max(Math.min(minHeight, cappedHeight), Math.min(cappedHeight, heightAboveKeyboard));
}

export default getBottomSheetHeight;
export {BOTTOM_SHEET_TOP_PADDING};
