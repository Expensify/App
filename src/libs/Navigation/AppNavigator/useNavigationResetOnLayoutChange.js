"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
/**
 * This hook resets the navigation root state when changing the layout size, resetting the state calls the getRehydratedState method in CustomFullScreenRouter.tsx.
 * It is also called when the navigator is created to set the initial state correctly.
 * When the screen size is changed, it is necessary to check whether the application displays the content correctly.
 * When the app is opened on a small layout and the user resizes it to wide, a second screen has to be present in the navigation state to fill the space.
 */
function useNavigationResetOnLayoutChange(_a) {
    var navigation = _a.navigation;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    (0, react_1.useEffect)(function () {
        if (!navigationRef_1.default.isReady()) {
            return;
        }
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);
}
exports.default = useNavigationResetOnLayoutChange;
