"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var onboardingRef = react_1.default.createRef();
var OnboardingRefManager = {
    ref: onboardingRef,
    handleOuterClick: function () {
        var _a;
        (_a = onboardingRef.current) === null || _a === void 0 ? void 0 : _a.handleOuterClick();
    },
};
exports.default = OnboardingRefManager;
