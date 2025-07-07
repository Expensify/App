"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var CONST_1 = require("@src/CONST");
function useCarouselArrows() {
    var canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    var _a = (0, react_1.useState)(canUseTouchScreen), shouldShowArrows = _a[0], setShouldShowArrowsInternal = _a[1];
    var autoHideArrowTimeout = (0, react_1.useRef)(null);
    /**
     * Cancels the automatic hiding of the arrows.
     */
    var cancelAutoHideArrows = (0, react_1.useCallback)(function () {
        if (!autoHideArrowTimeout.current) {
            return;
        }
        clearTimeout(autoHideArrowTimeout.current);
    }, []);
    /**
     * Automatically hide the arrows if there is no interaction for 3 seconds.
     */
    var autoHideArrows = (0, react_1.useCallback)(function () {
        if (!canUseTouchScreen) {
            return;
        }
        cancelAutoHideArrows();
        autoHideArrowTimeout.current = setTimeout(function () {
            setShouldShowArrowsInternal(false);
        }, CONST_1.default.ARROW_HIDE_DELAY);
    }, [canUseTouchScreen, cancelAutoHideArrows]);
    /**
     * Sets the visibility of the arrows.
     */
    var setShouldShowArrows = (0, react_1.useCallback)(function (show) {
        if (show === void 0) { show = true; }
        setShouldShowArrowsInternal(show);
        autoHideArrows();
    }, [autoHideArrows]);
    (0, react_1.useEffect)(function () {
        autoHideArrows();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return { shouldShowArrows: shouldShowArrows, setShouldShowArrows: setShouldShowArrows, autoHideArrows: autoHideArrows, cancelAutoHideArrows: cancelAutoHideArrows };
}
exports.default = useCarouselArrows;
