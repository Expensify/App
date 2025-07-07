"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ROUTES_1 = require("@src/ROUTES");
var Navigation_1 = require("./Navigation/Navigation");
var navigateAfterJoinRequest = function () {
    if (Navigation_1.default.getShouldPopToSidebar()) {
        Navigation_1.default.popToSidebar();
    }
    else {
        Navigation_1.default.goBack();
    }
    Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACES_LIST.route);
    });
};
exports.default = navigateAfterJoinRequest;
