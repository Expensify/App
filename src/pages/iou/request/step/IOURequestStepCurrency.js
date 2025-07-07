"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var useLocalize_1 = require("@hooks/useLocalize");
var CurrencyUtils = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var Url_1 = require("@libs/Url");
var IOU = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
function IOURequestStepCurrency(_a) {
    var _b;
    var _c = _a.route.params, backTo = _c.backTo, pageIndex = _c.pageIndex, transactionID = _c.transactionID, action = _c.action, _d = _c.currency, selectedCurrency = _d === void 0 ? '' : _d, draftTransaction = _a.draftTransaction, recentlyUsedCurrencies = _a.recentlyUsedCurrencies;
    var translate = (0, useLocalize_1.default)().translate;
    var _e = ((_b = ReportUtils.getTransactionDetails(draftTransaction)) !== null && _b !== void 0 ? _b : {}).currency, originalCurrency = _e === void 0 ? '' : _e;
    var currency = CurrencyUtils.isValidCurrencyCode(selectedCurrency) ? selectedCurrency : originalCurrency;
    var navigateBack = function (selectedCurrencyValue) {
        if (selectedCurrencyValue === void 0) { selectedCurrencyValue = ''; }
        // If the currency selection was done from the confirmation step (eg. + > submit expense > manual > confirm > amount > currency)
        // then the user needs taken back to the confirmation page instead of the initial amount page. This is because the route params
        // are only able to handle one backTo param at a time and the user needs to go back to the amount page before going back
        // to the confirmation page
        if (pageIndex === CONST_1.default.IOU.PAGE_INDEX.CONFIRM) {
            if (selectedCurrencyValue) {
                Navigation_1.default.goBack((0, Url_1.appendParam)(backTo, 'currency', selectedCurrencyValue), { compareParams: false });
            }
            else {
                Navigation_1.default.goBack(backTo);
            }
            return;
        }
        Navigation_1.default.goBack(backTo);
    };
    var confirmCurrencySelection = function (option) {
        react_native_1.Keyboard.dismiss();
        if (pageIndex !== CONST_1.default.IOU.PAGE_INDEX.CONFIRM) {
            IOU.setMoneyRequestCurrency(transactionID, option.currencyCode, action === CONST_1.default.IOU.ACTION.EDIT);
        }
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return navigateBack(option.currencyCode); });
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('common.selectCurrency')} onBackButtonPress={function () { return navigateBack(); }} shouldShowWrapper testID={IOURequestStepCurrency.displayName} includeSafeAreaPaddingBottom>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<CurrencySelectionList_1.default recentlyUsedCurrencies={recentlyUsedCurrencies !== null && recentlyUsedCurrencies !== void 0 ? recentlyUsedCurrencies : []} searchInputLabel={translate('common.search')} onSelect={function (option) {
                    if (!didScreenTransitionEnd) {
                        return;
                    }
                    confirmCurrencySelection(option);
                }} initiallySelectedCurrencyCode={currency.toUpperCase()}/>);
        }}
        </StepScreenWrapper_1.default>);
}
IOURequestStepCurrency.displayName = 'IOURequestStepCurrency';
var IOURequestStepCurrencyWithOnyx = (0, react_native_onyx_1.withOnyx)({
    draftTransaction: {
        key: function (_a) {
            var _b, _c;
            var route = _a.route;
            var transactionID = (_c = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.transactionID) !== null && _c !== void 0 ? _c : -1;
            return "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID);
        },
    },
    recentlyUsedCurrencies: {
        key: ONYXKEYS_1.default.RECENTLY_USED_CURRENCIES,
    },
})(IOURequestStepCurrency);
/* eslint-disable rulesdir/no-negated-variables */
var IOURequestStepCurrencyWithFullTransactionOrNotFound = (0, withFullTransactionOrNotFound_1.default)(IOURequestStepCurrencyWithOnyx);
exports.default = IOURequestStepCurrencyWithFullTransactionOrNotFound;
