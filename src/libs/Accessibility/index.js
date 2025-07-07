"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var moveAccessibilityFocus_1 = require("./moveAccessibilityFocus");
var useScreenReaderStatus = function () {
    var _a = (0, react_1.useState)(false), isScreenReaderEnabled = _a[0], setIsScreenReaderEnabled = _a[1];
    (0, react_1.useEffect)(function () {
        var subscription = react_native_1.AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled);
        return function () {
            subscription === null || subscription === void 0 ? void 0 : subscription.remove();
        };
    }, []);
    return isScreenReaderEnabled;
};
var getHitSlopForSize = function (_a) {
    var x = _a.x, y = _a.y;
    /* according to https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/
    the minimum tappable area is 44x44 points */
    var minimumSize = 44;
    var hitSlopVertical = Math.max(minimumSize - x, 0) / 2;
    var hitSlopHorizontal = Math.max(minimumSize - y, 0) / 2;
    return {
        top: hitSlopVertical,
        bottom: hitSlopVertical,
        left: hitSlopHorizontal,
        right: hitSlopHorizontal,
    };
};
var useAutoHitSlop = function () {
    var _a = (0, react_1.useState)({ x: 0, y: 0 }), frameSize = _a[0], setFrameSize = _a[1];
    var onLayout = (0, react_1.useCallback)(function (event) {
        var layout = event.nativeEvent.layout;
        if (layout.width !== frameSize.x && layout.height !== frameSize.y) {
            setFrameSize({ x: layout.width, y: layout.height });
        }
    }, [frameSize]);
    return [getHitSlopForSize(frameSize), onLayout];
};
exports.default = {
    moveAccessibilityFocus: moveAccessibilityFocus_1.default,
    useScreenReaderStatus: useScreenReaderStatus,
    useAutoHitSlop: useAutoHitSlop,
};
