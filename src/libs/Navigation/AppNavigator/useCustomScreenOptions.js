"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Browser_1 = require("@libs/Browser");
var useModalCardStyleInterpolator_1 = require("./useModalCardStyleInterpolator");
var useSideModalStackScreenOptions_1 = require("./useSideModalStackScreenOptions");
var useCustomScreenOptions = function () {
    var modalNavigatorOptions = (0, useSideModalStackScreenOptions_1.default)();
    var customInterpolator = (0, useModalCardStyleInterpolator_1.default)();
    return (0, react_1.useMemo)(function () {
        // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
        if ((0, Browser_1.isSafari)()) {
            return __assign(__assign({}, modalNavigatorOptions), { web: __assign(__assign({}, modalNavigatorOptions.web), { cardStyleInterpolator: function (props) { return customInterpolator({ props: props }); } }) });
        }
        return modalNavigatorOptions;
    }, [customInterpolator, modalNavigatorOptions]);
};
exports.default = useCustomScreenOptions;
