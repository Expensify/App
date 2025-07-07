"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldOnboardingRedirectToOldDot = shouldOnboardingRedirectToOldDot;
var CONST_1 = require("@src/CONST");
var getPlatform_1 = require("./getPlatform");
var supportedIntegrationsInNewDot = ['quickbooksOnline', 'quickbooksDesktop', 'xero', 'netsuite', 'intacct', 'other'];
/**
 * Determines if the user should be redirected to old dot based on company size and platform
 * @param companySize - The company size from onboarding
 * @param userReportedIntegration - The user reported integration
 * @returns boolean - True if user should be redirected to old dot
 */
function shouldOnboardingRedirectToOldDot(companySize, userReportedIntegration) {
    var isSupportedIntegration = (!!userReportedIntegration && supportedIntegrationsInNewDot.includes(userReportedIntegration)) || userReportedIntegration === null;
    return (0, getPlatform_1.default)() !== CONST_1.default.PLATFORM.DESKTOP && (!isSupportedIntegration || companySize !== CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO);
}
