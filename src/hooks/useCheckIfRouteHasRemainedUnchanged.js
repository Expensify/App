"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var Navigation_1 = require("@navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
/**
 * Hook that returns a function to check if the currently active route remains the same as the last known route.
 * The last known route reference is updated every time the component experiences a 'blur' event,
 * except when opening an attachments modal, which is treated as an exception and does not trigger a reference update.
 *
 * @return Function that checks if the last known route matches the currently active route.
 */
function useCheckIfRouteHasRemainedUnchanged() {
    var lastKnownRouteRef = (0, react_1.useRef)(undefined);
    var navigation = (0, native_1.useNavigation)();
    // Function to compare the last known route with the current active route
    var hasRouteRemainedUnchanged = (0, react_1.useCallback)(function () {
        return lastKnownRouteRef.current === Navigation_1.default.getActiveRouteWithoutParams();
    }, []);
    // Initialize the initial route when navigation is ready
    (0, react_1.useEffect)(function () {
        Navigation_1.default.isNavigationReady().then(function () {
            if (lastKnownRouteRef.current !== undefined) {
                return;
            }
            lastKnownRouteRef.current = Navigation_1.default.getActiveRouteWithoutParams();
        });
    }, []);
    // Update the route reference on 'blur' events, except when opening attachments modal
    (0, react_1.useEffect)(function () {
        return navigation.addListener('blur', function () {
            var currentRoute = Navigation_1.default.getActiveRouteWithoutParams();
            if (currentRoute === "/".concat(ROUTES_1.default.ATTACHMENTS.route)) {
                // Skip route update when attachment modal is opened
                return;
            }
            lastKnownRouteRef.current = currentRoute;
        });
    }, [navigation]);
    return hasRouteRemainedUnchanged;
}
exports.default = useCheckIfRouteHasRemainedUnchanged;
