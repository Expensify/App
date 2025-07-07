"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReviewDuplicatesNavigation_1 = require("@hooks/useReviewDuplicatesNavigation");
var Transaction_1 = require("@libs/actions/Transaction");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReviewDescription_1 = require("./ReviewDescription");
var ReviewFields_1 = require("./ReviewFields");
function ReviewTaxRate() {
    var _a, _b, _c;
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var reviewDuplicates = (0, useOnyx_1.default)(ONYXKEYS_1.default.REVIEW_DUPLICATES, { canBeMissing: true })[0];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_a = reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reportID) !== null && _a !== void 0 ? _a : route.params.threadReportID), { canBeMissing: true })[0];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)(report === null || report === void 0 ? void 0 : report.policyID);
    var transactionID = (0, TransactionUtils_1.getTransactionID)(route.params.threadReportID);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var transactionViolations = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID), {
        canBeMissing: false,
    })[0];
    var allDuplicateIDs = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.duplicates) !== null && _c !== void 0 ? _c : []; }, [transactionViolations]);
    var allDuplicates = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) { return allDuplicateIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; }); },
        canBeMissing: true,
    })[0];
    var compareResult = (0, TransactionUtils_1.compareDuplicateTransactionFields)(transaction, allDuplicates, reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reportID);
    var stepNames = Object.keys((_b = compareResult.change) !== null && _b !== void 0 ? _b : {}).map(function (key, index) { return (index + 1).toString(); });
    var _d = (0, useReviewDuplicatesNavigation_1.default)(Object.keys((_c = compareResult.change) !== null && _c !== void 0 ? _c : {}), 'taxCode', route.params.threadReportID, route.params.backTo), currentScreenIndex = _d.currentScreenIndex, goBack = _d.goBack, navigateToNextScreen = _d.navigateToNextScreen;
    var options = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = compareResult.change.taxCode) === null || _a === void 0 ? void 0 : _a.map(function (taxID) {
            var _a, _b, _c;
            return !taxID
                ? { text: translate('violations.none'), value: (_a = (0, TransactionUtils_1.getDefaultTaxCode)(policy, transaction)) !== null && _a !== void 0 ? _a : '' }
                : {
                    text: (_c = (_b = (0, PolicyUtils_1.getTaxByID)(policy, taxID)) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '',
                    value: taxID,
                };
        });
    }, [compareResult.change.taxCode, policy, transaction, translate]);
    var getTaxAmount = (0, react_1.useCallback)(function (taxID) {
        var _a;
        var taxPercentage = (0, TransactionUtils_1.getTaxValue)(policy, transaction, taxID);
        return (0, CurrencyUtils_1.convertToBackendAmount)((0, TransactionUtils_1.calculateTaxAmount)(taxPercentage !== null && taxPercentage !== void 0 ? taxPercentage : '', (0, TransactionUtils_1.getAmount)(transaction), (_a = transaction === null || transaction === void 0 ? void 0 : transaction.currency) !== null && _a !== void 0 ? _a : ''));
    }, [policy, transaction]);
    var setTaxCode = (0, react_1.useCallback)(function (data) {
        if (data.value !== undefined) {
            (0, Transaction_1.setReviewDuplicatesKey)({ taxCode: data.value, taxAmount: getTaxAmount(data.value) });
        }
        navigateToNextScreen();
    }, [getTaxAmount, navigateToNextScreen]);
    return (<ScreenWrapper_1.default testID={ReviewDescription_1.default.displayName}>
            <HeaderWithBackButton_1.default title={translate('iou.reviewDuplicates')} onBackButtonPress={goBack}/>
            <ReviewFields_1.default stepNames={stepNames} label={translate('violations.taxCodeToKeep')} options={options} index={currentScreenIndex} onSelectRow={setTaxCode}/>
        </ScreenWrapper_1.default>);
}
ReviewTaxRate.displayName = 'ReviewTaxRate';
exports.default = ReviewTaxRate;
