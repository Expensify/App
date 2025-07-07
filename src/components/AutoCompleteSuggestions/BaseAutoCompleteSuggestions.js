"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var ColorSchemeWrapper_1 = require("@components/ColorSchemeWrapper");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
function BaseAutoCompleteSuggestions(_a) {
    var _b = _a.highlightedSuggestionIndex, highlightedSuggestionIndex = _b === void 0 ? 0 : _b, onSelect = _a.onSelect, accessibilityLabelExtractor = _a.accessibilityLabelExtractor, renderSuggestionMenuItem = _a.renderSuggestionMenuItem, suggestions = _a.suggestions, keyExtractor = _a.keyExtractor, measuredHeightOfSuggestionRows = _a.measuredHeightOfSuggestionRows;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var rowHeight = (0, react_native_reanimated_1.useSharedValue)(0);
    var prevRowHeightRef = (0, react_1.useRef)(measuredHeightOfSuggestionRows);
    var fadeInOpacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var scrollRef = (0, react_1.useRef)(null);
    /**
     * Render a suggestion menu item component.
     */
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, index = _a.index;
        return (<PressableWithFeedback_1.default style={function (_a) {
            var hovered = _a.hovered;
            return StyleUtils.getAutoCompleteSuggestionItemStyle(highlightedSuggestionIndex, CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT, hovered, index);
        }} hoverDimmingValue={1} onMouseDown={function (e) { return e.preventDefault(); }} onPress={function () { return onSelect(index); }} onLongPress={function () { }} accessibilityLabel={accessibilityLabelExtractor(item, index)}>
                {renderSuggestionMenuItem(item, index)}
            </PressableWithFeedback_1.default>);
    }, [accessibilityLabelExtractor, renderSuggestionMenuItem, StyleUtils, highlightedSuggestionIndex, onSelect]);
    var innerHeight = CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT * suggestions.length;
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return (__assign({ opacity: fadeInOpacity.get() }, StyleUtils.getAutoCompleteSuggestionContainerStyle(rowHeight.get()))); });
    (0, react_1.useEffect)(function () {
        if (measuredHeightOfSuggestionRows === prevRowHeightRef.current) {
            fadeInOpacity.set((0, react_native_reanimated_1.withTiming)(1, {
                duration: 70,
                easing: react_native_reanimated_1.Easing.inOut(react_native_reanimated_1.Easing.ease),
            }));
            rowHeight.set(measuredHeightOfSuggestionRows);
        }
        else {
            fadeInOpacity.set(1);
            rowHeight.set((0, react_native_reanimated_1.withTiming)(measuredHeightOfSuggestionRows, {
                duration: 100,
                easing: react_native_reanimated_1.Easing.bezier(0.25, 0.1, 0.25, 1),
            }));
        }
        prevRowHeightRef.current = measuredHeightOfSuggestionRows;
    }, [suggestions.length, rowHeight, measuredHeightOfSuggestionRows, prevRowHeightRef, fadeInOpacity]);
    (0, react_1.useEffect)(function () {
        if (!scrollRef.current) {
            return;
        }
        // When using cursor control (moving the cursor with the space bar on the keyboard) on Android, moving the cursor too fast may cause an error.
        try {
            scrollRef.current.scrollToIndex({ index: highlightedSuggestionIndex, animated: true });
        }
        catch (e) {
            // eslint-disable-next-line no-console
        }
    }, [highlightedSuggestionIndex]);
    return (<react_native_reanimated_1.default.View style={[styles.autoCompleteSuggestionsContainer, animatedStyles]} onPointerDown={function (e) {
            if (DeviceCapabilities.hasHoverSupport()) {
                return;
            }
            e.preventDefault();
        }}>
            <ColorSchemeWrapper_1.default>
                <react_native_gesture_handler_1.FlatList ref={scrollRef} keyboardShouldPersistTaps="handled" data={suggestions} renderItem={renderItem} keyExtractor={keyExtractor} removeClippedSubviews={false} showsVerticalScrollIndicator={innerHeight > rowHeight.get()} extraData={[highlightedSuggestionIndex, renderSuggestionMenuItem]}/>
            </ColorSchemeWrapper_1.default>
        </react_native_reanimated_1.default.View>);
}
BaseAutoCompleteSuggestions.displayName = 'BaseAutoCompleteSuggestions';
exports.default = BaseAutoCompleteSuggestions;
