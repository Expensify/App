"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useScreenWrapperTransitionStatus;
var react_1 = require("react");
var ScreenWrapperStatusContext_1 = require("@components/ScreenWrapper/ScreenWrapperStatusContext");
/**
 * Hook to get the transition status of a screen inside a ScreenWrapper.
 * Use this hook if you can't get the transition status from the ScreenWrapper itself. Usually when ScreenWrapper is used inside TopTabNavigator.
 * @returns `didScreenTransitionEnd` flag to indicate if navigation transition ended.
 */
function useScreenWrapperTransitionStatus() {
    var context = (0, react_1.useContext)(ScreenWrapperStatusContext_1.default);
    if (context === undefined) {
        throw new Error("Couldn't find values for screen ScreenWrapper transition status. Are you inside a screen in ScreenWrapper?");
    }
    return { didScreenTransitionEnd: context.didScreenTransitionEnd };
}
