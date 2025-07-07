"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("../../src/CONST");
var ReimbursementAccountUtils_1 = require("../../src/libs/ReimbursementAccountUtils");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
describe('ReimbursementAccountUtils', function () {
    describe('getRouteForCurrentStep', function () {
        it("should return 'new' step if 'BankAccountStep' or '' is provided", function () {
            expect((0, ReimbursementAccountUtils_1.getRouteForCurrentStep)(CONST_1.default.BANK_ACCOUNT.STEP.BANK_ACCOUNT)).toEqual(ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
            expect((0, ReimbursementAccountUtils_1.getRouteForCurrentStep)('')).toEqual(ReimbursementAccountUtils_1.REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW);
        });
    });
});
