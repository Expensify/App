"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
/**
 * Hook to get a value from the current root navigation state using a selector.
 *
 * @param selector Selector function to get a value from the state.
 */
function useRootNavigationState(selector) {
    var _a = (0, react_1.useState)(function () { return selector(navigationRef_1.default.getRootState()); }), result = _a[0], setResult = _a[1];
    // We store the selector in a ref to avoid re-subscribing listeners every render
    var selectorRef = (0, react_1.useRef)(selector);
    (0, react_1.useEffect)(function () {
        selectorRef.current = selector;
    });
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigationRef_1.default.addListener('state', function (e) {
            setResult(selectorRef.current(e.data.state));
        });
        return unsubscribe;
    }, []);
    return result;
}
exports.default = useRootNavigationState;
