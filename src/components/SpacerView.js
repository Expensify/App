"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var usePrevious_1 = require("@hooks/usePrevious");
var CONST_1 = require("@src/CONST");
function SpacerView(_a) {
    var shouldShow = _a.shouldShow, style = _a.style;
    var marginVertical = (0, react_native_reanimated_1.useSharedValue)(shouldShow ? CONST_1.default.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST_1.default.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL);
    var borderBottomWidth = (0, react_native_reanimated_1.useSharedValue)(shouldShow ? CONST_1.default.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST_1.default.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH);
    var prevShouldShow = (0, usePrevious_1.default)(shouldShow);
    var duration = CONST_1.default.ANIMATED_TRANSITION;
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({
        borderBottomWidth: (0, react_native_reanimated_1.withTiming)(borderBottomWidth.get(), { duration: duration }),
        marginTop: (0, react_native_reanimated_1.withTiming)(marginVertical.get(), { duration: duration }),
        marginBottom: (0, react_native_reanimated_1.withTiming)(marginVertical.get(), { duration: duration }),
    }); });
    react_1.default.useEffect(function () {
        if (shouldShow === prevShouldShow) {
            return;
        }
        var values = {
            marginVertical: shouldShow ? CONST_1.default.HORIZONTAL_SPACER.DEFAULT_MARGIN_VERTICAL : CONST_1.default.HORIZONTAL_SPACER.HIDDEN_MARGIN_VERTICAL,
            borderBottomWidth: shouldShow ? CONST_1.default.HORIZONTAL_SPACER.DEFAULT_BORDER_BOTTOM_WIDTH : CONST_1.default.HORIZONTAL_SPACER.HIDDEN_BORDER_BOTTOM_WIDTH,
        };
        marginVertical.set(values.marginVertical);
        borderBottomWidth.set(values.borderBottomWidth);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we only need to trigger when shouldShow prop is changed
    }, [shouldShow, prevShouldShow]);
    return <react_native_reanimated_1.default.View style={[animatedStyles, style]}/>;
}
SpacerView.displayName = 'SpacerView';
exports.default = SpacerView;
