"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPreservedNavigatorStates = exports.getPreservedNavigatorState = void 0;
var react_1 = require("react");
var preservedNavigatorStates = {};
var cleanPreservedNavigatorStates = function (state) {
    var currentSplitNavigatorKeys = state.routes.map(function (route) { return route.key; });
    for (var _i = 0, _a = Object.keys(preservedNavigatorStates); _i < _a.length; _i++) {
        var key = _a[_i];
        if (!currentSplitNavigatorKeys.includes(key)) {
            delete preservedNavigatorStates[key];
        }
    }
};
exports.cleanPreservedNavigatorStates = cleanPreservedNavigatorStates;
var getPreservedNavigatorState = function (key) { return preservedNavigatorStates[key]; };
exports.getPreservedNavigatorState = getPreservedNavigatorState;
function usePreserveNavigatorState(state, route) {
    (0, react_1.useEffect)(function () {
        if (!route) {
            return;
        }
        preservedNavigatorStates[route.key] = state;
    }, [route, state]);
}
exports.default = usePreserveNavigatorState;
