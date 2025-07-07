"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
function useCarouselContextEvents(setShouldShowArrows) {
    var scale = (0, react_1.useRef)(1);
    var isScrollEnabled = (0, react_native_reanimated_1.useSharedValue)(true);
    /**
     * Toggles the arrows visibility
     */
    var onRequestToggleArrows = (0, react_1.useCallback)(function (showArrows) {
        if (showArrows === undefined) {
            setShouldShowArrows === null || setShouldShowArrows === void 0 ? void 0 : setShouldShowArrows(function (prevShouldShowArrows) { return !prevShouldShowArrows; });
            return;
        }
        setShouldShowArrows === null || setShouldShowArrows === void 0 ? void 0 : setShouldShowArrows(showArrows);
    }, [setShouldShowArrows]);
    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to react to zooming/pinching and (mostly) enabling/disabling scrolling on the pager,
     * as well as enabling/disabling the carousel buttons.
     */
    var handleScaleChange = (0, react_1.useCallback)(function (newScale) {
        if (newScale === scale.current) {
            return;
        }
        scale.current = newScale;
        var newIsScrollEnabled = newScale === 1;
        if (isScrollEnabled.get() === newIsScrollEnabled) {
            return;
        }
        isScrollEnabled.set(newIsScrollEnabled);
        onRequestToggleArrows(newIsScrollEnabled);
    }, [isScrollEnabled, onRequestToggleArrows]);
    /**
     * This callback is passed to the MultiGestureCanvas/Lightbox through the AttachmentCarouselPagerContext.
     * It is used to trigger touch events on the pager when the user taps on the MultiGestureCanvas/Lightbox.
     */
    var handleTap = (0, react_1.useCallback)(function () {
        if (!isScrollEnabled.get()) {
            return;
        }
        onRequestToggleArrows();
    }, [isScrollEnabled, onRequestToggleArrows]);
    return { handleTap: handleTap, handleScaleChange: handleScaleChange, scale: scale, isScrollEnabled: isScrollEnabled };
}
exports.default = useCarouselContextEvents;
