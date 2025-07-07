"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNavatticURL = getNavatticURL;
exports.getTestDriveURL = getTestDriveURL;
var CONST_1 = require("@src/CONST");
function getNavatticURL(environment, introSelected) {
    var adminTourURL = environment === CONST_1.default.ENVIRONMENT.PRODUCTION ? CONST_1.default.NAVATTIC.ADMIN_TOUR_PRODUCTION : CONST_1.default.NAVATTIC.ADMIN_TOUR_STAGING;
    var employeeTourURL = environment === CONST_1.default.ENVIRONMENT.PRODUCTION ? CONST_1.default.NAVATTIC.EMPLOYEE_TOUR_PRODUCTION : CONST_1.default.NAVATTIC.EMPLOYEE_TOUR_STAGING;
    return introSelected === CONST_1.default.SELECTABLE_ONBOARDING_CHOICES.MANAGE_TEAM ? adminTourURL : employeeTourURL;
}
function getTestDriveURL(shouldUseNarrowLayout, introSelected) {
    if (shouldUseNarrowLayout) {
        return introSelected === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE ? CONST_1.default.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE : CONST_1.default.STORYLANE.ADMIN_TOUR_MOBILE;
    }
    return introSelected === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE ? CONST_1.default.STORYLANE.TRACK_WORKSPACE_TOUR : CONST_1.default.STORYLANE.ADMIN_TOUR;
}
