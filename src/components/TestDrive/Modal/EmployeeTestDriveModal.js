"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var fake_test_drive_employee_receipt_jpg_1 = require("@assets/images/fake-test-drive-employee-receipt.jpg");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var IOU_1 = require("@libs/actions/IOU");
var Onboarding_1 = require("@libs/actions/Onboarding");
var setTestReceipt_1 = require("@libs/actions/setTestReceipt");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var BaseTestDriveModal_1 = require("./BaseTestDriveModal");
function EmployeeTestDriveModal() {
    var _a, _b;
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var _c = (0, react_1.useState)((_b = (_a = route.params) === null || _a === void 0 ? void 0 : _a.bossEmail) !== null && _b !== void 0 ? _b : ''), bossEmail = _c[0], setBossEmail = _c[1];
    var _d = (0, react_1.useState)(), formError = _d[0], setFormError = _d[1];
    var _e = (0, react_1.useState)(false), isLoading = _e[0], setIsLoading = _e[1];
    var testDrive = (0, useOnboardingMessages_1.default)().testDrive;
    var onBossEmailChange = (0, react_1.useCallback)(function (value) {
        setBossEmail(value);
        setFormError(undefined);
    }, []);
    var navigate = function () {
        var loginTrim = bossEmail.trim();
        if (!loginTrim || !expensify_common_1.Str.isValidEmail(loginTrim)) {
            setFormError(translate('common.error.email'));
            return;
        }
        setIsLoading(true);
        (0, Onboarding_1.verifyTestDriveRecipient)(bossEmail)
            .then(function () {
            (0, setTestReceipt_1.default)(fake_test_drive_employee_receipt_jpg_1.default, 'jpg', function (source, _, filename) {
                var transactionID = CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID;
                var reportID = (0, ReportUtils_1.generateReportID)();
                (0, IOU_1.initMoneyRequest)({
                    reportID: reportID,
                    isFromGlobalCreate: false,
                    newIouRequestType: CONST_1.default.IOU.REQUEST_TYPE.SCAN,
                });
                (0, IOU_1.setMoneyRequestReceipt)(transactionID, source, filename, true, CONST_1.default.TEST_RECEIPT.FILE_TYPE, false, true);
                (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
                    {
                        accountID: (0, UserUtils_1.generateAccountID)(bossEmail),
                        login: bossEmail,
                        displayName: bossEmail,
                        selected: true,
                    },
                ]);
                (0, IOU_1.setMoneyRequestAmount)(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.AMOUNT, testDrive.EMPLOYEE_FAKE_RECEIPT.CURRENCY);
                (0, IOU_1.setMoneyRequestDescription)(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.DESCRIPTION, true);
                (0, IOU_1.setMoneyRequestMerchant)(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.MERCHANT, true);
                (0, IOU_1.setMoneyRequestCreated)(transactionID, (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING), true);
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    Navigation_1.default.goBack();
                    Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID));
                });
            }, function () {
                setIsLoading(false);
                setFormError(translate('testDrive.modal.employee.error'));
            });
        })
            .catch(function () {
            setIsLoading(false);
            setFormError(translate('testDrive.modal.employee.error'));
        });
    };
    var skipTestDrive = function () {
        Navigation_1.default.dismissModal();
    };
    return (<BaseTestDriveModal_1.default description={translate('testDrive.modal.employee.description')} onConfirm={navigate} onHelp={skipTestDrive} shouldCloseOnConfirm={false} shouldRenderHTMLDescription avoidKeyboard shouldShowConfirmationLoader={isLoading} canConfirmWhileOffline={false} shouldCallOnHelpWhenModalHidden>
            <TextInput_1.default placeholder={translate('testDrive.modal.employee.email')} accessibilityLabel={translate('testDrive.modal.employee.email')} value={bossEmail} onChangeText={onBossEmailChange} autoCapitalize="none" errorText={formError} inputMode={CONST_1.default.INPUT_MODE.EMAIL}/>
        </BaseTestDriveModal_1.default>);
}
EmployeeTestDriveModal.displayName = 'EmployeeTestDriveModal';
exports.default = EmployeeTestDriveModal;
