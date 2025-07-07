"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AdminTestDriveModal_1 = require("./AdminTestDriveModal");
var EmployeeTestDriveModal_1 = require("./EmployeeTestDriveModal");
function TestDriveModal() {
    var introSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, { canBeMissing: false })[0];
    var isAdminTester = (introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM || (introSelected === null || introSelected === void 0 ? void 0 : introSelected.choice) === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE;
    return isAdminTester ? <AdminTestDriveModal_1.default /> : <EmployeeTestDriveModal_1.default />;
}
TestDriveModal.displayName = 'TestDriveModal';
exports.default = TestDriveModal;
