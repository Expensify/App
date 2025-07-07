"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var BaseTestDriveModal_1 = require("./BaseTestDriveModal");
function AdminTestDriveModal() {
    var translate = (0, useLocalize_1.default)().translate;
    var onboarding = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: false })[0];
    var onboardingReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(onboarding === null || onboarding === void 0 ? void 0 : onboarding.chatReportID), { canBeMissing: true })[0];
    var navigate = function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Navigation_1.default.navigate(ROUTES_1.default.TEST_DRIVE_DEMO_ROOT);
        });
    };
    var skipTestDrive = function () {
        Navigation_1.default.dismissModal();
        react_native_1.InteractionManager.runAfterInteractions(function () {
            if (!(0, ReportUtils_1.isAdminRoom)(onboardingReport)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(onboardingReport === null || onboardingReport === void 0 ? void 0 : onboardingReport.reportID));
        });
    };
    return (<BaseTestDriveModal_1.default description={translate('testDrive.modal.description')} onConfirm={navigate} onHelp={skipTestDrive} shouldCallOnHelpWhenModalHidden/>);
}
AdminTestDriveModal.displayName = 'AdminTestDriveModal';
exports.default = AdminTestDriveModal;
