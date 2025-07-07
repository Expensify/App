"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useOnboardingMessages;
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var OnboardingFlow_1 = require("@libs/actions/Welcome/OnboardingFlow");
function useOnboardingMessages() {
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var onboardingMessages = (0, react_1.useMemo)(function () { return (0, OnboardingFlow_1.getOnboardingMessages)(preferredLocale); }, [preferredLocale]);
    return onboardingMessages;
}
