"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TourUtils_1 = require("@libs/TourUtils");
var CONST_1 = require("@src/CONST");
describe('TourUtils', function () {
    describe('getTestDriveURL', function () {
        describe('Intro selected is Track Workspace', function () {
            it('returns proper URL when screen is narrow', function () {
                var url = (0, TourUtils_1.getTestDriveURL)(true, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                expect(url).toBe(CONST_1.default.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE);
            });
            it('returns proper URL when screen is not narrow', function () {
                var url = (0, TourUtils_1.getTestDriveURL)(false, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                expect(url).toBe(CONST_1.default.STORYLANE.TRACK_WORKSPACE_TOUR);
            });
        });
        describe('Intro selected is Track Workspace', function () {
            it('returns proper URL when screen is narrow', function () {
                var url = (0, TourUtils_1.getTestDriveURL)(true);
                expect(url).toBe(CONST_1.default.STORYLANE.ADMIN_TOUR_MOBILE);
            });
            it('returns proper URL when screen is not narrow', function () {
                var url = (0, TourUtils_1.getTestDriveURL)(false);
                expect(url).toBe(CONST_1.default.STORYLANE.ADMIN_TOUR);
            });
        });
    });
});
