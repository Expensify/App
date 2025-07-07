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
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReviewFields_1 = require("./ReviewFields");
function ReviewTag() {
    var _a, _b;
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var transactionID = (0, TransactionUtils_1.getTransactionID)(route.params.threadReportID);
    var reviewDuplicates = (0, useOnyx_1.default)(ONYXKEYS_1.default.REVIEW_DUPLICATES, { canBeMissing: true })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var transactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: function (allTransactionsViolations) { return allTransactionsViolations === null || allTransactionsViolations === void 0 ? void 0 : allTransactionsViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID)]; },
        canBeMissing: false,
    })[0];
    var allDuplicateIDs = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = (_b = (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations.find(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; })) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.duplicates) !== null && _c !== void 0 ? _c : []; }, [transactionViolations]);
    var allDuplicates = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION), {
        selector: function (allTransactions) { return allDuplicateIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(id)]; }); },
        canBeMissing: true,
    })[0];
    var compareResult = (0, TransactionUtils_1.compareDuplicateTransactionFields)(transaction, allDuplicates, reviewDuplicates === null || reviewDuplicates === void 0 ? void 0 : reviewDuplicates.reportID);
    var stepNames = Object.keys((_a = compareResult.change) !== null && _a !== void 0 ? _a : {}).map(function (key, index) { return (index + 1).toString(); });
    var _c = (0, useReviewDuplicatesNavigation_1.default)(Object.keys((_b = compareResult.change) !== null && _b !== void 0 ? _b : {}), 'tag', route.params.threadReportID, route.params.backTo), currentScreenIndex = _c.currentScreenIndex, goBack = _c.goBack, navigateToNextScreen = _c.navigateToNextScreen;
    var options = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = compareResult.change.tag) === null || _a === void 0 ? void 0 : _a.map(function (tag) {
            return !tag
                ? { text: translate('violations.none'), value: '' }
                : {
                    text: (0, PolicyUtils_1.getCleanedTagName)(tag),
                    value: tag,
                };
        });
    }, [compareResult.change.tag, translate]);
    var setTag = function (data) {
        if (data.value !== undefined) {
            (0, Transaction_1.setReviewDuplicatesKey)({ tag: data.value });
        }
        navigateToNextScreen();
    };
    return (<ScreenWrapper_1.default testID={ReviewTag.displayName}>
            <HeaderWithBackButton_1.default title={translate('iou.reviewDuplicates')} onBackButtonPress={goBack}/>
            <ReviewFields_1.default stepNames={stepNames} label={translate('violations.tagToKeep')} options={options} index={currentScreenIndex} onSelectRow={setTag}/>
        </ScreenWrapper_1.default>);
}
ReviewTag.displayName = 'ReviewTag';
exports.default = ReviewTag;
