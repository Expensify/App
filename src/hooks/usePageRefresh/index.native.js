"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_error_boundary_1 = require("react-error-boundary");
var usePageRefresh = function () {
    var resetBoundary = (0, react_error_boundary_1.useErrorBoundary)().resetBoundary;
    return resetBoundary;
};
exports.default = usePageRefresh;
