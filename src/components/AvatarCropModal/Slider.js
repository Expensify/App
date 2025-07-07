"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser = require("@libs/Browser");
var ControlSelection_1 = require("@libs/ControlSelection");
// This component can't be written using class since reanimated API uses hooks.
function Slider(_a) {
    var sliderValue = _a.sliderValue, gestureCallbacks = _a.gestureCallbacks;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(true), tooltipIsVisible = _b[0], setTooltipIsVisible = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    // A reanimated memoized style, which tracks
    // a translateX shared value and updates the slider position.
    var rSliderStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        'worklet';
        return {
            transform: [{ translateX: sliderValue.get() }],
        };
    });
    var panGesture = react_native_gesture_handler_1.Gesture.Pan()
        .minDistance(5)
        .onBegin(function () {
        (0, react_native_reanimated_1.runOnJS)(setTooltipIsVisible)(false);
        gestureCallbacks.onBegin();
    })
        .onChange(function (event) {
        gestureCallbacks.onChange(event);
    })
        .onFinalize(function () {
        (0, react_native_reanimated_1.runOnJS)(setTooltipIsVisible)(true);
        gestureCallbacks.onFinalize();
    });
    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (<react_native_1.View ref={function (el) { return ControlSelection_1.default.blockElement(el); }} style={styles.sliderBar}>
            <react_native_gesture_handler_1.GestureDetector gesture={panGesture}>
                <react_native_reanimated_1.default.View style={[styles.sliderKnob, rSliderStyle]}>
                    {tooltipIsVisible && (<Tooltip_1.default text={translate('common.zoom')} shiftVertical={-2}>
                            {/* pointerEventsNone is a workaround to make sure the pan gesture works correctly on mobile safari */}
                            <react_native_1.View style={[styles.sliderKnobTooltipView, Browser.isMobileSafari() && styles.pointerEventsNone]}/>
                        </Tooltip_1.default>)}
                </react_native_reanimated_1.default.View>
            </react_native_gesture_handler_1.GestureDetector>
        </react_native_1.View>);
}
Slider.displayName = 'Slider';
exports.default = Slider;
