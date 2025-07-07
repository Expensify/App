"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var IOU_1 = require("@libs/actions/IOU");
var Navigation_1 = require("@libs/Navigation/Navigation");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var MoneyRequestAttendeeSelector_1 = require("@pages/iou/request/MoneyRequestAttendeeSelector");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepAttendees(_a) {
    var _b = _a.route.params, transactionID = _b.transactionID, reportID = _b.reportID, iouType = _b.iouType, backTo = _b.backTo, action = _b.action, policy = _a.policy, policyTags = _a.policyTags, policyCategories = _a.policyCategories;
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    // eslint-disable-next-line rulesdir/no-default-id-values
    var transaction = (0, useOnyx_1.default)("".concat(isEditing ? ONYXKEYS_1.default.COLLECTION.TRANSACTION : ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID || CONST_1.default.DEFAULT_NUMBER_ID), { canBeMissing: true })[0];
    var _c = (0, react_1.useState)(function () { return (0, TransactionUtils_1.getAttendees)(transaction); }), attendees = _c[0], setAttendees = _c[1];
    var previousAttendees = (0, usePrevious_1.default)(attendees);
    var translate = (0, useLocalize_1.default)().translate;
    var transactionViolations = (0, useTransactionViolations_1.default)(transactionID);
    var saveAttendees = (0, react_1.useCallback)(function () {
        if (attendees.length <= 0) {
            return;
        }
        if (!(0, fast_equals_1.deepEqual)(previousAttendees, attendees)) {
            (0, IOU_1.setMoneyRequestAttendees)(transactionID, attendees, !isEditing);
            if (isEditing) {
                (0, IOU_1.updateMoneyRequestAttendees)(transactionID, reportID, attendees, policy, policyTags, policyCategories, transactionViolations !== null && transactionViolations !== void 0 ? transactionViolations : undefined);
            }
        }
        Navigation_1.default.goBack(backTo);
    }, [attendees, backTo, isEditing, policy, policyCategories, policyTags, previousAttendees, reportID, transactionID, transactionViolations]);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.attendees')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepAttendees.displayName}>
            <MoneyRequestAttendeeSelector_1.default onFinish={saveAttendees} onAttendeesAdded={function (v) { return setAttendees(v); }} attendees={attendees} iouType={iouType} action={action}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepAttendees.displayName = 'IOURequestStepAttendees';
exports.default = (0, withWritableReportOrNotFound_1.default)(IOURequestStepAttendees);
