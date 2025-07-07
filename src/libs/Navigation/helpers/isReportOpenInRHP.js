"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var isReportOpenInRHP = function (state) {
    var _a, _b, _c;
    var lastRoute = (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a.at(-1);
    if (!lastRoute) {
        return false;
    }
    var params = lastRoute.params;
    if (params && 'screen' in params && typeof params.screen === 'string' && params.screen === SCREENS_1.default.RIGHT_MODAL.SEARCH_REPORT) {
        return true;
    }
    return !!(lastRoute.name === NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR && ((_c = (_b = lastRoute.state) === null || _b === void 0 ? void 0 : _b.routes) === null || _c === void 0 ? void 0 : _c.some(function (route) { return (route === null || route === void 0 ? void 0 : route.name) === SCREENS_1.default.RIGHT_MODAL.SEARCH_REPORT; })));
};
exports.default = isReportOpenInRHP;
