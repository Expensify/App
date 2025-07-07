"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useIsScrollBarVisible = function (ref, value) {
    var _a = (0, react_1.useState)(false), isScrollBarVisible = _a[0], setIsScrollBarVisible = _a[1];
    var handleResize = (0, react_1.useCallback)(function () {
        if (!ref.current) {
            return;
        }
        var _a = ref.current, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
        setIsScrollBarVisible(scrollHeight > clientHeight);
    }, [ref]);
    (0, react_1.useEffect)(function () {
        if (!ref.current || !('ResizeObserver' in (window || {}))) {
            return;
        }
        var resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(ref.current);
        return function () {
            resizeObserver.disconnect();
        };
    }, [handleResize, ref, value]);
    return isScrollBarVisible;
};
exports.default = useIsScrollBarVisible;
