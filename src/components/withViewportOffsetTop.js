"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = withViewportOffsetTop;
var react_1 = require("react");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var VisualViewport_1 = require("@libs/VisualViewport");
function withViewportOffsetTop(WrappedComponent) {
    function WithViewportOffsetTop(props, ref) {
        var _a = (0, react_1.useState)(0), viewportOffsetTop = _a[0], setViewportOffsetTop = _a[1];
        (0, react_1.useEffect)(function () {
            var updateDimensions = function (event) {
                var targetOffsetTop = (event.target instanceof VisualViewport && event.target.offsetTop) || 0;
                setViewportOffsetTop(targetOffsetTop);
            };
            var removeViewportResizeListener = (0, VisualViewport_1.default)(updateDimensions);
            return function () {
                removeViewportResizeListener();
            };
        }, []);
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} ref={ref} viewportOffsetTop={viewportOffsetTop}/>);
    }
    WithViewportOffsetTop.displayName = "WithViewportOffsetTop(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return (0, react_1.forwardRef)(WithViewportOffsetTop);
}
