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
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReviewFields_1 = require("./ReviewFields");
function ReviewCategory() {
    var _a, _b;
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var transactionID = (0, TransactionUtils_1.getTransactionID)(route.params.threadReportID);
    var reviewDuplicates = (0, useOnyx_1.default)(ONYXKEYS_1.default.REVIEW_DUPLICATES, { canBeMissing: true })[0];
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
    var stepNames = Object.keys((_a = compareResult.change) !== null && _a !== void 0 ? _a : {}).map(function (key, index) { return (index + 1).toString(); });
    var _c = (0, useReviewDuplicatesNavigation_1.default)(Object.keys((_b = compareResult.change) !== null && _b !== void 0 ? _b : {}), 'category', route.params.threadReportID, route.params.backTo), currentScreenIndex = _c.currentScreenIndex, goBack = _c.goBack, navigateToNextScreen = _c.navigateToNextScreen;
    var options = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = compareResult.change.category) === null || _a === void 0 ? void 0 : _a.map(function (category) {
            return !category
                ? { text: translate('violations.none'), value: '' }
                : {
                    text: category,
                    value: category,
                };
        });
    }, [compareResult.change.category, translate]);
    var setCategory = function (data) {
        if (data.value !== undefined) {
            (0, Transaction_1.setReviewDuplicatesKey)({ category: data.value });
        }
        navigateToNextScreen();
    };
    return (<ScreenWrapper_1.default testID={ReviewCategory.displayName}>
            <HeaderWithBackButton_1.default title={translate('iou.reviewDuplicates')} onBackButtonPress={goBack}/>
            <ReviewFields_1.default stepNames={stepNames} label={translate('violations.categoryToKeep')} options={options} index={currentScreenIndex} onSelectRow={setCategory}/>
        </ScreenWrapper_1.default>);
}
ReviewCategory.displayName = 'ReviewCategory';
exports.default = ReviewCategory;
