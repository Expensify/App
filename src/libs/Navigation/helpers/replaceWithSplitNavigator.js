"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var CONST_1 = require("@src/CONST");
function replaceWithSplitNavigator(splitNavigatorState) {
    var _a;
    (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch({
        target: navigationRef_1.default.current.getRootState().key,
        payload: splitNavigatorState,
        type: CONST_1.default.NAVIGATION.ACTION_TYPE.REPLACE,
    });
}
exports.default = replaceWithSplitNavigator;
