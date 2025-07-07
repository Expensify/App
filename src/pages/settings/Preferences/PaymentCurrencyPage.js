"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
function PaymentCurrencyPage() {
    var _a, _b;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalPolicyID = (_a = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _a === void 0 ? void 0 : _a.id;
    var personalPolicy = (0, usePolicy_1.default)(personalPolicyID);
    var paymentCurrency = (_b = personalPolicy === null || personalPolicy === void 0 ? void 0 : personalPolicy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={PaymentCurrencyPage.displayName}>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('billingCurrency.paymentCurrency')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>

                    <Text_1.default style={[styles.mh5, styles.mv4]}>{translate('billingCurrency.paymentCurrencyDescription')}</Text_1.default>

                    <CurrencySelectionList_1.default recentlyUsedCurrencies={[]} searchInputLabel={translate('common.search')} onSelect={function (option) {
                    var _a;
                    if (!didScreenTransitionEnd) {
                        return;
                    }
                    if (option.currencyCode !== paymentCurrency) {
                        (0, Policy_1.updateGeneralSettings)(personalPolicyID, (_a = personalPolicy === null || personalPolicy === void 0 ? void 0 : personalPolicy.name) !== null && _a !== void 0 ? _a : '', option.currencyCode);
                    }
                    Navigation_1.default.goBack();
                }} initiallySelectedCurrencyCode={paymentCurrency}/>
                </>);
        }}
        </ScreenWrapper_1.default>);
}
PaymentCurrencyPage.displayName = 'PaymentCurrencyPage';
exports.default = PaymentCurrencyPage;
