"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var replaceCompanyCardsRoute = function (route) {
    return route === null || route === void 0 ? void 0 : route.replace(/\/edit\/export$/, '');
};
exports.default = replaceCompanyCardsRoute;
