import React, {useEffect} from 'react';
import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensionsForAutoCompleteSuggestions from '@hooks/useWindowDimensionsForAutoCompleteSuggestions';
import {hasHoverSupport} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import AutoCompleteSuggestionsPortal from './AutoCompleteSuggestionsPortal';
import type {AutoCompleteSuggestionsProps, MeasureParentContainerAndCursor} from './types';

const measureHeightOfSuggestionRows = (numRows: number, canBeBig: boolean, isInLandscapeMode: boolean): number => {
    if (isInLandscapeMode) {
        if (numRows > 1) {
            // In landscape mode, we display a scrollable window with a height of 1.5 items, indicating that there are more items available beyond what is currently visible
            return CONST.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR_LANDSCAPE_MODE * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        }

        return numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    if (canBeBig) {
        if (numRows > CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER) {
            // On large screens, if there are more than 5 suggestions, we display a scrollable window with a height of 5 items, indicating that there are more items available
            return CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        }
        return numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    if (numRows > 2) {
        // On small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    return numRows * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
};
function isSuggestionMenuRenderedAbove(isEnoughSpaceAboveForBigMenu: boolean, isEnoughSpaceAboveForSmallMenu: boolean): boolean {
    return isEnoughSpaceAboveForBigMenu || isEnoughSpaceAboveForSmallMenu;
}

type IsEnoughSpaceToRenderMenuAboveCursor = Pick<MeasureParentContainerAndCursor, 'y' | 'cursorCoordinates' | 'scrollValue'> & {
    contentHeight: number;
    topInset: number;
};
function isEnoughSpaceToRenderMenuAboveCursor({y, cursorCoordinates, scrollValue, contentHeight, topInset}: IsEnoughSpaceToRenderMenuAboveCursor): boolean {
    return y + (cursorCoordinates.y - scrollValue) > contentHeight + topInset + CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_BOX_MAX_SAFE_DISTANCE;
}

const initialContainerState = {
    width: 0,
    left: 0,
    bottom: 0,
    cursorCoordinates: {x: 0, y: 0},
};

function getLeftOffset(x: number, leftInset: number, bigScreenLeftOffset: number, shouldUseNarrowLayout: boolean, isInLandscapeMode: boolean): number {
    if (shouldUseNarrowLayout) {
        return isInLandscapeMode ? x - leftInset : x;
    }
    return bigScreenLeftOffset;
}

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */
function AutoCompleteSuggestions<TSuggestion>({measureParentContainerAndReportCursor = () => {}, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isInitialRender = React.useRef<boolean>(true);
    const isSuggestionMenuAboveRef = React.useRef<boolean>(false);
    const leftValue = React.useRef<number>(0);
    const prevLeftValue = React.useRef<number>(0);
    const {height: windowHeight, width: windowWidth} = useWindowDimensionsForAutoCompleteSuggestions();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const prevIsInLandscapeModeValue = React.useRef(isInLandscapeMode);
    const [suggestionHeight, setSuggestionHeight] = React.useState(0);
    const [containerState, setContainerState] = React.useState(initialContainerState);
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {keyboardHeight, isKeyboardAnimatingRef} = useKeyboardState();
    const {paddingBottom: bottomInset, paddingTop: topInset} = StyleUtils.getPlatformSafeAreaPadding(insets ?? undefined);
    const {left: leftInset} = insets;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return () => {};
        }
        container.onpointerdown = (e) => {
            if (hasHoverSupport()) {
                return;
            }
            e.preventDefault();
        };
        return () => (container.onpointerdown = null);
    }, []);

    const suggestionsLength = props.suggestions.length;

    useEffect(() => {
        if (!measureParentContainerAndReportCursor || isKeyboardAnimatingRef.current) {
            return;
        }

        if (!windowHeight || !windowWidth || !suggestionsLength) {
            setContainerState(initialContainerState);
            return;
        }

        measureParentContainerAndReportCursor(({x, y, width, scrollValue, cursorCoordinates}: MeasureParentContainerAndCursor) => {
            const xCoordinatesOfCursor = x + cursorCoordinates.x;
            const bigScreenLeftOffset =
                xCoordinatesOfCursor + CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH > windowWidth
                    ? windowWidth - CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH
                    : xCoordinatesOfCursor;
            const contentMaxHeight = measureHeightOfSuggestionRows(suggestionsLength, true, isInLandscapeMode);
            const contentMinHeight = measureHeightOfSuggestionRows(suggestionsLength, false, isInLandscapeMode);
            let bottomValue = windowHeight - (cursorCoordinates.y - scrollValue + y) - keyboardHeight;
            const widthValue = shouldUseNarrowLayout ? width : CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH;

            const isEnoughSpaceToRenderMenuAboveForBig = isEnoughSpaceToRenderMenuAboveCursor({
                y,
                cursorCoordinates,
                scrollValue,
                contentHeight: contentMaxHeight,
                topInset,
            });

            // In landscape mode, we always render the menu above the cursor
            const isEnoughSpaceToRenderMenuAboveForSmall =
                isInLandscapeMode ||
                isEnoughSpaceToRenderMenuAboveCursor({
                    y,
                    cursorCoordinates,
                    scrollValue,
                    contentHeight: contentMinHeight,
                    topInset,
                });

            const newLeftOffset = getLeftOffset(x, leftInset, bigScreenLeftOffset, shouldUseNarrowLayout, isInLandscapeMode);
            // If the suggested word is longer than 150 (approximately half the width of the suggestion popup), then adjust a new position of popup
            const isAdjustmentNeeded = Math.abs(prevLeftValue.current - bigScreenLeftOffset) > 150;
            if (isInitialRender.current || isAdjustmentNeeded || prevIsInLandscapeModeValue.current !== isInLandscapeMode) {
                isSuggestionMenuAboveRef.current = isSuggestionMenuRenderedAbove(isEnoughSpaceToRenderMenuAboveForBig, isEnoughSpaceToRenderMenuAboveForSmall);
                leftValue.current = newLeftOffset;
                isInitialRender.current = false;
                prevLeftValue.current = newLeftOffset;
                prevIsInLandscapeModeValue.current = isInLandscapeMode;
            }

            let measuredHeight = 0;
            if (isSuggestionMenuAboveRef.current && isEnoughSpaceToRenderMenuAboveForBig) {
                // calculation for big suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true, isInLandscapeMode);
            } else if (isSuggestionMenuAboveRef.current && isEnoughSpaceToRenderMenuAboveForSmall) {
                // calculation for small suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, false, isInLandscapeMode);
            } else {
                // calculation for big suggestion box below the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true, isInLandscapeMode);
                bottomValue = windowHeight - y - cursorCoordinates.y + scrollValue - measuredHeight - CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT - keyboardHeight;
            }

            setSuggestionHeight(measuredHeight);
            setContainerState({
                left: leftValue.current,
                bottom: bottomValue,
                width: widthValue,
                cursorCoordinates,
            });
        });
    }, [
        measureParentContainerAndReportCursor,
        windowHeight,
        windowWidth,
        keyboardHeight,
        shouldUseNarrowLayout,
        suggestionsLength,
        bottomInset,
        topInset,
        isKeyboardAnimatingRef,
        isInLandscapeMode,
        leftInset,
    ]);

    // Prevent rendering if container dimensions are not set or if we have no suggestions
    if ((containerState.width === 0 && containerState.left === 0 && containerState.bottom === 0) || !suggestionsLength) {
        return null;
    }

    return (
        <AutoCompleteSuggestionsPortal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            left={containerState.left}
            width={containerState.width}
            bottom={containerState.bottom}
            measuredHeightOfSuggestionRows={suggestionHeight}
            isInLandscapeMode={isInLandscapeMode}
        />
    );
}

export default AutoCompleteSuggestions;
