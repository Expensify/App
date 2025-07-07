"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var useCleanupSelectedOptions = function (cleanupFunction) {
    var navigationContainerRef = (0, react_1.useContext)(native_1.NavigationContainerRefContext);
    var state = navigationContainerRef === null || navigationContainerRef === void 0 ? void 0 : navigationContainerRef.getState();
    var lastRoute = state === null || state === void 0 ? void 0 : state.routes.at(-1);
    var isRightModalOpening = (lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) === NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR;
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        if (isFocused || isRightModalOpening) {
            return;
        }
        cleanupFunction === null || cleanupFunction === void 0 ? void 0 : cleanupFunction();
    }, [isFocused, cleanupFunction, isRightModalOpening]);
};
exports.default = useCleanupSelectedOptions;
