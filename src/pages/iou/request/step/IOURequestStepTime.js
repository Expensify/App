"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var TimeModalPicker_1 = require("@components/TimeModalPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var MoneyRequestTimeForm_1 = require("@src/types/form/MoneyRequestTimeForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepTime(_a) {
    var _b;
    var _c, _d, _e, _f;
    var _g = _a.route, _h = _g.params, action = _h.action, iouType = _h.iouType, reportID = _h.reportID, transactionID = _h.transactionID, backTo = _h.backTo, name = _g.name, transaction = _a.transaction, report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var currentDateAttributes = (_e = (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.customUnit) === null || _d === void 0 ? void 0 : _d.attributes) === null || _e === void 0 ? void 0 : _e.dates;
    var currentStartDate = (currentDateAttributes === null || currentDateAttributes === void 0 ? void 0 : currentDateAttributes.start) ? DateUtils_1.default.extractDate(currentDateAttributes.start) : undefined;
    var currentEndDate = (currentDateAttributes === null || currentDateAttributes === void 0 ? void 0 : currentDateAttributes.end) ? DateUtils_1.default.extractDate(currentDateAttributes.end) : undefined;
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFound = !(0, IOUUtils_1.isValidMoneyRequestType)(iouType) || (0, EmptyObject_1.isEmptyObject)((_f = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _f === void 0 ? void 0 : _f.customUnit) || (0, EmptyObject_1.isEmptyObject)(policy);
    var isEditPage = name === SCREENS_1.default.MONEY_REQUEST.STEP_TIME_EDIT;
    var perDiemCustomUnits = (0, PolicyUtils_1.getPerDiemCustomUnits)(allPolicies, session === null || session === void 0 ? void 0 : session.email);
    var moreThanOnePerDiemExist = perDiemCustomUnits.length > 1;
    var navigateBack = function () {
        if (isEditPage) {
            Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
            return;
        }
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        if (transaction === null || transaction === void 0 ? void 0 : transaction.isFromGlobalCreate) {
            if (moreThanOnePerDiemExist) {
                Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, reportID));
                return;
            }
            // If there is only one per diem policy, we can't override the reportID that is already on the stack to make sure we go back to the right screen.
            Navigation_1.default.goBack();
        }
        Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_PER_DIEM.getRoute(action, iouType, transactionID, reportID));
    };
    var validate = function (value) {
        var errors = {};
        var newStart = DateUtils_1.default.combineDateAndTime(value.startTime, value.startDate);
        var newEnd = DateUtils_1.default.combineDateAndTime(value.endTime, value.endDate);
        var isValid = DateUtils_1.default.isValidStartEndTimeRange({ startTime: newStart, endTime: newEnd });
        if (!isValid) {
            (0, ErrorUtils_1.addErrorMessage)(errors, MoneyRequestTimeForm_1.default.END_TIME, translate('common.error.invalidTimeShouldBeFuture'));
        }
        return errors;
    };
    var updateTime = function (value) {
        var newStart = DateUtils_1.default.combineDateAndTime(value.startTime, value.startDate);
        var newEnd = DateUtils_1.default.combineDateAndTime(value.endTime, value.endDate);
        (0, IOU_1.setMoneyRequestDateAttribute)(transactionID, newStart, newEnd);
        if (isEditPage) {
            navigateBack();
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, transactionID, reportID));
        }
    };
    var tabTitles = (_b = {},
        _b[CONST_1.default.IOU.TYPE.REQUEST] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SUBMIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SEND] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.PAY] = translate('iou.paySomeone', { name: '' }),
        _b[CONST_1.default.IOU.TYPE.SPLIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SPLIT_EXPENSE] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.TRACK] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.INVOICE] = translate('workspace.invoices.sendInvoice'),
        _b[CONST_1.default.IOU.TYPE.CREATE] = translate('iou.createExpense'),
        _b);
    return (<StepScreenWrapper_1.default headerTitle={backTo ? translate('iou.time') : tabTitles[iouType]} onBackButtonPress={navigateBack} shouldShowNotFoundPage={shouldShowNotFound} shouldShowWrapper testID={IOURequestStepTime.displayName} includeSafeAreaPaddingBottom>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_TIME_FORM} validate={validate} onSubmit={updateTime} submitButtonText={translate('common.save')} enabledWhenOffline>
                <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={MoneyRequestTimeForm_1.default.START_DATE} label={translate('iou.startDate')} defaultValue={currentStartDate} maxDate={CONST_1.default.CALENDAR_PICKER.MAX_DATE} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE}/>
                <react_native_1.View style={[styles.mt2, styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={TimeModalPicker_1.default} inputID={MoneyRequestTimeForm_1.default.START_TIME} label={translate('iou.startTime')} defaultValue={currentDateAttributes === null || currentDateAttributes === void 0 ? void 0 : currentDateAttributes.start}/>
                </react_native_1.View>
                <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={MoneyRequestTimeForm_1.default.END_DATE} label={translate('iou.endDate')} defaultValue={currentEndDate} maxDate={CONST_1.default.CALENDAR_PICKER.MAX_DATE} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE}/>
                <react_native_1.View style={[styles.mt2, styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={TimeModalPicker_1.default} inputID={MoneyRequestTimeForm_1.default.END_TIME} label={translate('iou.endTime')} defaultValue={currentDateAttributes === null || currentDateAttributes === void 0 ? void 0 : currentDateAttributes.end}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </StepScreenWrapper_1.default>);
}
IOURequestStepTime.displayName = 'IOURequestStepTime';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTimeWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepTime);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepTimeWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepTimeWithFullTransactionOrNotFound);
exports.default = IOURequestStepTimeWithWritableReportOrNotFound;
