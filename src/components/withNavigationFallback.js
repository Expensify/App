"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var core_1 = require("@react-navigation/core");
var react_1 = require("react");
function default_1(WrappedComponent) {
    function WithNavigationFallback(props, ref) {
        var context = (0, react_1.useContext)(core_1.NavigationContext);
        var navigationContextValue = (0, react_1.useMemo)(function () { return ({
            isFocused: function () { return true; },
            addListener: function () { return function () { }; },
            removeListener: function () { return function () { }; },
        }); }, []);
        return context ? (<WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} ref={ref}/>) : (<core_1.NavigationContext.Provider value={navigationContextValue}>
                <WrappedComponent 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} ref={ref}/>
            </core_1.NavigationContext.Provider>);
    }
    WithNavigationFallback.displayName = 'WithNavigationFocusWithFallback';
    return (0, react_1.forwardRef)(WithNavigationFallback);
}
