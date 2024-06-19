import React, {useEffect} from 'react';
import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import AutoCompleteSuggestionsPortal from './AutoCompleteSuggestionsPortal';
import type {AutoCompleteSuggestionsProps, MeasureParentContainerAndCursor} from './types';

const measureHeightOfSuggestionRows = (numRows: number, canBeBig: boolean): number => {
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
function isSuggestionRenderedAbove(isEnoughSpaceAboveForBig: boolean, isEnoughSpaceAboveForSmall: boolean): boolean {
    return isEnoughSpaceAboveForBig || isEnoughSpaceAboveForSmall;
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
    const isSuggestionAboveRef = React.useRef<boolean>(false);
    const leftValue = React.useRef<number>(0);
    const prevLeftValue = React.useRef<number>(0);
    const {windowHeight, windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const [suggestionHeight, setSuggestionHeight] = React.useState(0);
    const [containerState, setContainerState] = React.useState({
        width: 0,
        left: 0,
        bottom: 0,
    });
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const {keyboardHeight} = useKeyboardState();
    const {paddingBottom: bottomInset} = StyleUtils.getSafeAreaPadding(insets ?? undefined);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return () => {};
        }
        container.onpointerdown = (e) => {
            if (DeviceCapabilities.hasHoverSupport()) {
                return;
            }
            e.preventDefault();
        };
        return () => (container.onpointerdown = null);
    }, []);

    const suggestionsLength = props.suggestions.length;

    useEffect(() => {
        if (!measureParentContainerAndReportCursor) {
            return;
        }

        measureParentContainerAndReportCursor(({x, y, width, scrollValue, cursorCoordinates}: MeasureParentContainerAndCursor) => {
            const xCoordinatesOfCursor = x + cursorCoordinates.x;
            const leftValueForBigScreen =
                xCoordinatesOfCursor + CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH > windowWidth
                    ? windowWidth - CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH
                    : xCoordinatesOfCursor;

            let bottomValue = windowHeight - y - cursorCoordinates.y + scrollValue - (keyboardHeight || bottomInset);
            const widthValue = isSmallScreenWidth ? width : CONST.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH;

            const contentMaxHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
            const contentMinHeight = measureHeightOfSuggestionRows(suggestionsLength, false);
            const isEnoughSpaceAboveForBig = windowHeight - bottomValue - contentMaxHeight > CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_BOX_MAX_SAFE_DISTANCE;
            const isEnoughSpaceAboveForSmall = windowHeight - bottomValue - contentMinHeight > CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_BOX_MAX_SAFE_DISTANCE;

            const newLeftValue = isSmallScreenWidth ? x : leftValueForBigScreen;
            // If the suggested word is longer than 150 (approximately half the width of the suggestion popup), then adjust a new position of popup
            const isAdjustmentNeeded = Math.abs(prevLeftValue.current - leftValueForBigScreen) > 150;
            if (isInitialRender.current || isAdjustmentNeeded) {
                isSuggestionAboveRef.current = isSuggestionRenderedAbove(isEnoughSpaceAboveForBig, isEnoughSpaceAboveForSmall);
                leftValue.current = newLeftValue;
                isInitialRender.current = false;
                prevLeftValue.current = newLeftValue;
            }

            let measuredHeight = 0;
            if (isSuggestionAboveRef.current && isEnoughSpaceAboveForBig) {
                // calculation for big suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
            } else if (isSuggestionAboveRef.current && isEnoughSpaceAboveForSmall) {
                // calculation for small suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, false);
            } else {
                // calculation for big suggestion box below the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
                bottomValue = windowHeight - y - cursorCoordinates.y + scrollValue - measuredHeight - CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
            }
            setSuggestionHeight(measuredHeight);
            setContainerState({
                left: leftValue.current,
                bottom: bottomValue,
                width: widthValue,
            });
        });
    }, [measureParentContainerAndReportCursor, windowHeight, windowWidth, keyboardHeight, isSmallScreenWidth, suggestionsLength, bottomInset]);

    if (containerState.width === 0 && containerState.left === 0 && containerState.bottom === 0) {
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
        />
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
