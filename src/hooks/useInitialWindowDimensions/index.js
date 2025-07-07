"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
// eslint-disable-next-line no-restricted-imports
var react_1 = require("react");
var react_native_1 = require("react-native");
/**
 * A convenience hook that provides initial size (width and height).
 * An initial height allows to know the real height of window,
 * while the standard useWindowDimensions hook return the height minus Virtual keyboard height
 * @returns with information about initial width and height
 */
function default_1() {
    var _a = (0, react_1.useState)(function () {
        var window = react_native_1.Dimensions.get('window');
        var screen = react_native_1.Dimensions.get('screen');
        return {
            screenHeight: screen.height,
            screenWidth: screen.width,
            initialHeight: window.height,
            initialWidth: window.width,
        };
    }), dimensions = _a[0], setDimensions = _a[1];
    (0, react_1.useEffect)(function () {
        var onDimensionChange = function (newDimensions) {
            var window = newDimensions.window, screen = newDimensions.screen;
            setDimensions(function (oldState) {
                if (screen.width !== oldState.screenWidth || screen.height !== oldState.screenHeight || window.height > oldState.initialHeight) {
                    return {
                        initialHeight: window.height,
                        initialWidth: window.width,
                        screenHeight: screen.height,
                        screenWidth: screen.width,
                    };
                }
                return oldState;
            });
        };
        var dimensionsEventListener = react_native_1.Dimensions.addEventListener('change', onDimensionChange);
        return function () {
            if (!dimensionsEventListener) {
                return;
            }
            dimensionsEventListener.remove();
        };
    }, []);
    return {
        initialWidth: dimensions.initialWidth,
        initialHeight: dimensions.initialHeight,
    };
}
