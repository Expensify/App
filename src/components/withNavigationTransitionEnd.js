"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
function default_1(WrappedComponent) {
    function WithNavigationTransitionEnd(props, ref) {
        var _a = (0, react_1.useState)(false), didScreenTransitionEnd = _a[0], setDidScreenTransitionEnd = _a[1];
        var navigation = (0, native_1.useNavigation)();
        (0, react_1.useEffect)(function () {
            var unsubscribeTransitionEnd = navigation.addListener('transitionEnd', function () {
                setDidScreenTransitionEnd(true);
            });
            return unsubscribeTransitionEnd;
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, []);
        return (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} didScreenTransitionEnd={didScreenTransitionEnd} ref={ref}/>);
    }
    WithNavigationTransitionEnd.displayName = "WithNavigationTransitionEnd(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
    return react_1.default.forwardRef(WithNavigationTransitionEnd);
}
