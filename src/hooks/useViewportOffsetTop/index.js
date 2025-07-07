"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useViewportOffsetTop;
var react_1 = require("react");
var Browser = require("@libs/Browser");
var VisualViewport_1 = require("@libs/VisualViewport");
/**
 * A hook that returns the offset of the top edge of the visual viewport
 */
function useViewportOffsetTop(shouldAdjustScrollView) {
    if (shouldAdjustScrollView === void 0) { shouldAdjustScrollView = false; }
    var _a = (0, react_1.useState)(0), viewportOffsetTop = _a[0], setViewportOffsetTop = _a[1];
    var cachedDefaultOffsetTop = (0, react_1.useRef)(0);
    var updateOffsetTop = (0, react_1.useCallback)(function (event) {
        var _a, _b;
        var targetOffsetTop = (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.offsetTop) !== null && _b !== void 0 ? _b : 0;
        if ((event === null || event === void 0 ? void 0 : event.target) instanceof VisualViewport) {
            targetOffsetTop = event.target.offsetTop;
        }
        if (Browser.isMobileSafari() && shouldAdjustScrollView && window.visualViewport) {
            var clientHeight = document.body.clientHeight;
            var adjustScrollY = clientHeight - window.visualViewport.height;
            if (cachedDefaultOffsetTop.current === 0) {
                cachedDefaultOffsetTop.current = targetOffsetTop;
            }
            if (adjustScrollY > targetOffsetTop) {
                setViewportOffsetTop(adjustScrollY);
            }
            else if (targetOffsetTop !== 0 && adjustScrollY === targetOffsetTop) {
                setViewportOffsetTop(cachedDefaultOffsetTop.current);
            }
            else {
                setViewportOffsetTop(targetOffsetTop);
            }
        }
        else {
            setViewportOffsetTop(targetOffsetTop);
        }
    }, [shouldAdjustScrollView]);
    (0, react_1.useEffect)(function () { return (0, VisualViewport_1.default)(updateOffsetTop); }, [updateOffsetTop]);
    (0, react_1.useEffect)(function () {
        // We don't want to trigger window.scrollTo when we are already at the target position. It causes unnecessary style recalculations.
        if (!shouldAdjustScrollView || viewportOffsetTop === window.scrollY) {
            return;
        }
        window.scrollTo({ top: viewportOffsetTop, behavior: 'smooth' });
    }, [shouldAdjustScrollView, viewportOffsetTop]);
    return viewportOffsetTop;
}
