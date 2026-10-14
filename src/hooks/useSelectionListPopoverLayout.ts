import getBottomSheetHeight from '@libs/getBottomSheetHeight';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import useKeyboardState from './useKeyboardState';
import useResponsiveLayout from './useResponsiveLayout';
import useSafeAreaPaddings from './useSafeAreaPaddings';
import useStyleUtils from './useStyleUtils';
import useThemeStyles from './useThemeStyles';
import useViewportOffsetTop from './useViewportOffsetTop';
import useWindowDimensions from './useWindowDimensions';

type UseSelectionListPopoverLayoutParams = {
    /** How many rows the list renders, section headings included */
    optionCount: number;

    /** Whether the list shows its search input */
    isSearchable: boolean;

    /** Width of the pop-over on a wide layout */
    popoverWidth: number;

    /** Tallest the pop-over may be */
    popoverHeight: number;

    /** Whether the pop-over shrinks to the height its list needs, treating `popoverHeight` as a ceiling */
    shouldFitContentHeight: boolean;

    /** Height of a header shown above the list */
    headerHeight?: number;
};

/**
 * Sizes a selection list shown in `PopoverWithMeasuredContent`: a pop-over on a wide layout, and on a narrow one a
 * bottom sheet that fits the window, rises above the keyboard and pads itself for the bottom safe area.
 */
function useSelectionListPopoverLayout({optionCount, isSearchable, popoverWidth, popoverHeight, shouldFitContentHeight, headerHeight = 0}: UseSelectionListPopoverLayoutParams) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive, keyboardActiveHeight} = useKeyboardState();
    const {windowHeight} = useWindowDimensions();
    const viewportOffsetTop = useViewportOffsetTop();
    const {paddingTop: safeAreaTop, paddingBottom: safeAreaPaddingBottom} = useSafeAreaPaddings(true);

    const estimatedContentHeight = getSelectionListPopoverContentHeight({optionCount: Math.max(optionCount, 1), isSearchable}) + headerHeight;
    // The sheet pads itself above the home indicator, except while the keyboard already covers it. The offline indicator
    // is drawn on the page behind the sheet, so no room is kept for it.
    const bottomSafeAreaPadding = isSmallScreenWidth && !isKeyboardActive ? safeAreaPaddingBottom : 0;
    const bottomSheetHeight = getBottomSheetHeight({
        preferredHeight: popoverHeight,
        windowHeight,
        keyboardHeight: isKeyboardActive ? keyboardActiveHeight : 0,
        topSafeAreaInset: safeAreaTop,
        minHeight: getSelectionListPopoverContentHeight({optionCount: 1, isSearchable}) + headerHeight,
    });
    // A short list gets a sheet only as tall as its rows, still within the room the window and keyboard leave.
    const fittedSheetHeight = shouldFitContentHeight ? Math.min(bottomSheetHeight, estimatedContentHeight + bottomSafeAreaPadding) : bottomSheetHeight;
    const popoverContentHeight = shouldFitContentHeight ? Math.min(popoverHeight, estimatedContentHeight) : popoverHeight;
    const height = isSmallScreenWidth ? fittedSheetHeight : popoverContentHeight;

    return {
        popoverDimensions: {width: popoverWidth, height},
        innerContainerStyle: isSmallScreenWidth ? undefined : StyleUtils.getWidthStyle(popoverWidth),
        // Mobile Safari ignores `interactive-widget=resizes-content` and leaves the sheet docked behind the keyboard, so on mobile browsers
        // the sheet is sized and offset to the visual viewport, which the keyboard does shrink.
        outerStyle: isSmallScreenWidth ? {...styles.w100, ...StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)} : undefined,
        avoidKeyboard: isSmallScreenWidth,
        contentStyle: [StyleUtils.getHeight(height), styles.flexColumn, styles.pt4, StyleUtils.getPaddingBottom(bottomSafeAreaPadding)],
    };
}

export default useSelectionListPopoverLayout;
