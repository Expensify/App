"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// The coordinates are based on the App's height, not the device height.
// So we need to get the height from useWindowDimensions to calculate the position correctly. More details: https://github.com/Expensify/App/issues/53180
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
var AutoCompleteSuggestionsPortal_1 = require("./AutoCompleteSuggestionsPortal");
var measureHeightOfSuggestionRows = function (numRows, canBeBig) {
    if (canBeBig) {
        if (numRows > CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER) {
            // On large screens, if there are more than 5 suggestions, we display a scrollable window with a height of 5 items, indicating that there are more items available
            return CONST_1.default.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
        }
        return numRows * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    if (numRows > 2) {
        // On small screens, we display a scrollable window with a height of 2.5 items, indicating that there are more items available beyond what is currently visible
        return CONST_1.default.AUTO_COMPLETE_SUGGESTER.SMALL_CONTAINER_HEIGHT_FACTOR * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
    }
    return numRows * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT;
};
function isSuggestionMenuRenderedAbove(isEnoughSpaceAboveForBigMenu, isEnoughSpaceAboveForSmallMenu) {
    return isEnoughSpaceAboveForBigMenu || isEnoughSpaceAboveForSmallMenu;
}
function isEnoughSpaceToRenderMenuAboveCursor(_a) {
    var y = _a.y, cursorCoordinates = _a.cursorCoordinates, scrollValue = _a.scrollValue, contentHeight = _a.contentHeight, topInset = _a.topInset;
    return y + (cursorCoordinates.y - scrollValue) > contentHeight + topInset + CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_BOX_MAX_SAFE_DISTANCE;
}
var initialContainerState = {
    width: 0,
    left: 0,
    bottom: 0,
    cursorCoordinates: { x: 0, y: 0 },
};
/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */
function AutoCompleteSuggestions(_a) {
    var _b = _a.measureParentContainerAndReportCursor, measureParentContainerAndReportCursor = _b === void 0 ? function () { } : _b, props = __rest(_a, ["measureParentContainerAndReportCursor"]);
    var containerRef = react_1.default.useRef(null);
    var isInitialRender = react_1.default.useRef(true);
    var isSuggestionMenuAboveRef = react_1.default.useRef(false);
    var leftValue = react_1.default.useRef(0);
    var prevLeftValue = react_1.default.useRef(0);
    var _c = (0, react_native_1.useWindowDimensions)(), windowHeight = _c.height, windowWidth = _c.width;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _d = react_1.default.useState(0), suggestionHeight = _d[0], setSuggestionHeight = _d[1];
    var _e = react_1.default.useState(initialContainerState), containerState = _e[0], setContainerState = _e[1];
    var StyleUtils = (0, useStyleUtils_1.default)();
    var insets = (0, useSafeAreaInsets_1.default)();
    var _f = (0, useKeyboardState_1.default)(), keyboardHeight = _f.keyboardHeight, isKeyboardAnimatingRef = _f.isKeyboardAnimatingRef;
    var _g = StyleUtils.getPlatformSafeAreaPadding(insets !== null && insets !== void 0 ? insets : undefined), bottomInset = _g.paddingBottom, topInset = _g.paddingTop;
    (0, react_1.useEffect)(function () {
        var container = containerRef.current;
        if (!container) {
            return function () { };
        }
        container.onpointerdown = function (e) {
            if ((0, DeviceCapabilities_1.hasHoverSupport)()) {
                return;
            }
            e.preventDefault();
        };
        return function () { return (container.onpointerdown = null); };
    }, []);
    var suggestionsLength = props.suggestions.length;
    (0, react_1.useEffect)(function () {
        if (!measureParentContainerAndReportCursor || isKeyboardAnimatingRef.current) {
            return;
        }
        if (!windowHeight || !windowWidth || !suggestionsLength) {
            setContainerState(initialContainerState);
            return;
        }
        measureParentContainerAndReportCursor(function (_a) {
            var x = _a.x, y = _a.y, width = _a.width, scrollValue = _a.scrollValue, cursorCoordinates = _a.cursorCoordinates;
            var xCoordinatesOfCursor = x + cursorCoordinates.x;
            var bigScreenLeftOffset = xCoordinatesOfCursor + CONST_1.default.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH > windowWidth
                ? windowWidth - CONST_1.default.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH
                : xCoordinatesOfCursor;
            var contentMaxHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
            var contentMinHeight = measureHeightOfSuggestionRows(suggestionsLength, false);
            var bottomValue = windowHeight - (cursorCoordinates.y - scrollValue + y) - keyboardHeight;
            var widthValue = shouldUseNarrowLayout ? width : CONST_1.default.AUTO_COMPLETE_SUGGESTER.BIG_SCREEN_SUGGESTION_WIDTH;
            var isEnoughSpaceToRenderMenuAboveForBig = isEnoughSpaceToRenderMenuAboveCursor({
                y: y,
                cursorCoordinates: cursorCoordinates,
                scrollValue: scrollValue,
                contentHeight: contentMaxHeight,
                topInset: topInset,
            });
            var isEnoughSpaceToRenderMenuAboveForSmall = isEnoughSpaceToRenderMenuAboveCursor({
                y: y,
                cursorCoordinates: cursorCoordinates,
                scrollValue: scrollValue,
                contentHeight: contentMinHeight,
                topInset: topInset,
            });
            var newLeftOffset = shouldUseNarrowLayout ? x : bigScreenLeftOffset;
            // If the suggested word is longer than 150 (approximately half the width of the suggestion popup), then adjust a new position of popup
            var isAdjustmentNeeded = Math.abs(prevLeftValue.current - bigScreenLeftOffset) > 150;
            if (isInitialRender.current || isAdjustmentNeeded) {
                isSuggestionMenuAboveRef.current = isSuggestionMenuRenderedAbove(isEnoughSpaceToRenderMenuAboveForBig, isEnoughSpaceToRenderMenuAboveForSmall);
                leftValue.current = newLeftOffset;
                isInitialRender.current = false;
                prevLeftValue.current = newLeftOffset;
            }
            var measuredHeight = 0;
            if (isSuggestionMenuAboveRef.current && isEnoughSpaceToRenderMenuAboveForBig) {
                // calculation for big suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
            }
            else if (isSuggestionMenuAboveRef.current && isEnoughSpaceToRenderMenuAboveForSmall) {
                // calculation for small suggestion box above the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, false);
            }
            else {
                // calculation for big suggestion box below the cursor
                measuredHeight = measureHeightOfSuggestionRows(suggestionsLength, true);
                bottomValue = windowHeight - y - cursorCoordinates.y + scrollValue - measuredHeight - CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT - keyboardHeight;
            }
            setSuggestionHeight(measuredHeight);
            setContainerState({
                left: leftValue.current,
                bottom: bottomValue,
                width: widthValue,
                cursorCoordinates: cursorCoordinates,
            });
        });
    }, [measureParentContainerAndReportCursor, windowHeight, windowWidth, keyboardHeight, shouldUseNarrowLayout, suggestionsLength, bottomInset, topInset, isKeyboardAnimatingRef]);
    // Prevent rendering if container dimensions are not set or if we have no suggestions
    if ((containerState.width === 0 && containerState.left === 0 && containerState.bottom === 0) || !suggestionsLength) {
        return null;
    }
    return (<AutoCompleteSuggestionsPortal_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} left={containerState.left} width={containerState.width} bottom={containerState.bottom} measuredHeightOfSuggestionRows={suggestionHeight}/>);
}
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';
exports.default = AutoCompleteSuggestions;
