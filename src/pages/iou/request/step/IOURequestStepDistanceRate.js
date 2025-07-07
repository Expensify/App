"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepDistanceRate(_a) {
    var _b;
    var report = _a.report, reportDraft = _a.reportDraft, _c = _a.route.params, action = _c.action, reportID = _c.reportID, backTo = _c.backTo, transactionID = _c.transactionID, transaction = _a.transaction;
    var policyDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_DRAFTS).concat((0, IOU_1.getIOURequestPolicyID)(transaction, reportDraft)))[0];
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    var policyReal = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID))[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(report === null || report === void 0 ? void 0 : report.policyID))[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(report === null || report === void 0 ? void 0 : report.policyID))[0];
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
    var policy = policyReal !== null && policyReal !== void 0 ? policyReal : policyDraft;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, toLocaleDigit = _d.toLocaleDigit;
    var isDistanceRequest = (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var isPolicyExpenseChat = (0, ReportUtils_1.isReportInGroupPolicy)(report);
    var shouldShowTax = (0, PolicyUtils_1.isTaxTrackingEnabled)(isPolicyExpenseChat, policy, isDistanceRequest);
    var isEditing = action === CONST_1.default.IOU.ACTION.EDIT;
    var currentRateID = (0, TransactionUtils_1.getRateID)(transaction);
    var transactionCurrency = (0, TransactionUtils_1.getCurrency)(transaction);
    var rates = DistanceRequestUtils_1.default.getMileageRates(policy, false, currentRateID);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var sections = Object.values(rates)
        .sort(function (rateA, rateB) { var _a, _b; return ((_a = rateA === null || rateA === void 0 ? void 0 : rateA.rate) !== null && _a !== void 0 ? _a : 0) - ((_b = rateB === null || rateB === void 0 ? void 0 : rateB.rate) !== null && _b !== void 0 ? _b : 0); })
        .map(function (rate) {
        var _a, _b, _c;
        var unit = ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitRateID) === rate.customUnitRateID ? DistanceRequestUtils_1.default.getDistanceUnit(transaction, rate) : rate.unit;
        var isSelected = currentRateID ? currentRateID === rate.customUnitRateID : rate.name === CONST_1.default.CUSTOM_UNITS.DEFAULT_RATE;
        var rateForDisplay = DistanceRequestUtils_1.default.getRateForDisplay(unit, rate.rate, isSelected ? transactionCurrency : rate.currency, translate, toLocaleDigit);
        return {
            text: (_c = rate.name) !== null && _c !== void 0 ? _c : rateForDisplay,
            alternateText: rate.name ? rateForDisplay : '',
            keyForList: rate.customUnitRateID,
            value: rate.customUnitRateID,
            isDisabled: !rate.enabled,
            isSelected: isSelected,
        };
    });
    var initiallyFocusedOption = (_b = sections.find(function (item) { return item.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList;
    function selectDistanceRate(customUnitRateID) {
        var _a, _b;
        var taxAmount;
        var taxRateExternalID;
        if (shouldShowTax) {
            var policyCustomUnitRate = (0, PolicyUtils_1.getDistanceRateCustomUnitRate)(policy, customUnitRateID);
            taxRateExternalID = (_a = policyCustomUnitRate === null || policyCustomUnitRate === void 0 ? void 0 : policyCustomUnitRate.attributes) === null || _a === void 0 ? void 0 : _a.taxRateExternalID;
            var unit = DistanceRequestUtils_1.default.getDistanceUnit(transaction, rates[customUnitRateID]);
            var taxableAmount = DistanceRequestUtils_1.default.getTaxableAmount(policy, customUnitRateID, (0, TransactionUtils_1.getDistanceInMeters)(transaction, unit));
            var taxPercentage = taxRateExternalID ? (0, TransactionUtils_1.getTaxValue)(policy, transaction, taxRateExternalID) : undefined;
            taxAmount = (0, CurrencyUtils_1.convertToBackendAmount)((0, TransactionUtils_1.calculateTaxAmount)(taxPercentage, taxableAmount, (_b = rates[customUnitRateID].currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD));
            (0, IOU_1.setMoneyRequestTaxAmount)(transactionID, taxAmount);
            (0, IOU_1.setMoneyRequestTaxRate)(transactionID, taxRateExternalID !== null && taxRateExternalID !== void 0 ? taxRateExternalID : null);
        }
        if (currentRateID !== customUnitRateID) {
            (0, IOU_1.setMoneyRequestDistanceRate)(transactionID, customUnitRateID, policy, (0, IOUUtils_1.shouldUseTransactionDraft)(action));
            if (isEditing && (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
                (0, IOU_1.updateMoneyRequestDistanceRate)(transaction.transactionID, reportID, customUnitRateID, policy, policyTags, policyCategories, taxAmount, taxRateExternalID);
            }
        }
        navigateBack();
    }
    return (<StepScreenWrapper_1.default headerTitle={translate('common.rate')} onBackButtonPress={navigateBack} shouldShowWrapper testID={IOURequestStepDistanceRate.displayName}>
            <Text_1.default style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate')}</Text_1.default>

            <SelectionList_1.default sections={[{ data: sections }]} ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return selectDistanceRate(value !== null && value !== void 0 ? value : '');
    }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={initiallyFocusedOption}/>
        </StepScreenWrapper_1.default>);
}
IOURequestStepDistanceRate.displayName = 'IOURequestStepDistanceRate';
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDistanceRateWithWritableReportOrNotFound = (0, withWritableReportOrNotFound_1.default)(IOURequestStepDistanceRate);
// eslint-disable-next-line rulesdir/no-negated-variables
var IOURequestStepDistanceRateWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepDistanceRateWithWritableReportOrNotFound);
exports.default = IOURequestStepDistanceRateWithFullTransactionOrNotFound;
