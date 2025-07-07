"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var IOU_1 = require("@libs/actions/IOU");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var MoneyRequestAccountantSelector_1 = require("@pages/iou/request/MoneyRequestAccountantSelector");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepAccountant(_a) {
    var _b = _a.route.params, transactionID = _b.transactionID, reportID = _b.reportID, iouType = _b.iouType, backTo = _b.backTo, action = _b.action;
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: false })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var setAccountant = (0, react_1.useCallback)(function (accountant) {
        (0, IOU_1.setMoneyRequestAccountant)(transactionID, accountant, true);
    }, [transactionID]);
    var navigateToNextStep = (0, react_1.useCallback)(function () {
        // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
        var hasActiveAdminWorkspaces = (0, PolicyUtils_1.hasActiveAdminWorkspaces)(currentUserLogin);
        if (!hasActiveAdminWorkspaces) {
            (0, ReportUtils_1.createDraftWorkspaceAndNavigateToConfirmationScreen)(transactionID, action);
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID, undefined, action));
    }, [iouType, transactionID, reportID, action, currentUserLogin]);
    var navigateBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo);
    }, [backTo]);
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.whoIsYourAccountant')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepAccountant.displayName}>
            <MoneyRequestAccountantSelector_1.default onFinish={navigateToNextStep} onAccountantSelected={setAccountant} iouType={iouType} action={action}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepAccountant.displayName = 'IOURequestStepAccountant';
exports.default = (0, withWritableReportOrNotFound_1.default)(IOURequestStepAccountant);
