"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
function PaymentCardCurrencyModal(_a) {
    var isVisible = _a.isVisible, currencies = _a.currencies, _b = _a.currentCurrency, currentCurrency = _b === void 0 ? CONST_1.default.PAYMENT_CARD_CURRENCY.USD : _b, onCurrencyChange = _a.onCurrencyChange, onClose = _a.onClose;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var sections = (0, react_1.useMemo)(function () { return ({
        sections: [
            {
                data: currencies.map(function (currency) { return ({
                    text: currency,
                    value: currency,
                    keyForList: currency,
                    isSelected: currency === currentCurrency,
                }); }),
            },
        ],
    }); }, [currencies, currentCurrency]).sections;
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={function () { return onClose === null || onClose === void 0 ? void 0 : onClose(); }} onModalHide={onClose} hideModalContentWhileAnimating innerContainerStyle={styles.RHPNavigatorContainer(shouldUseNarrowLayout)} onBackdropPress={Navigation_1.default.dismissModal} useNativeDriver>
            <ScreenWrapper_1.default style={styles.pb0} includePaddingTop={false} includeSafeAreaPaddingBottom={false} testID={PaymentCardCurrencyModal.displayName}>
                <HeaderWithBackButton_1.default title={translate('common.currency')} onBackButtonPress={onClose}/>
                <SelectionList_1.default sections={sections} onSelectRow={function (option) {
            onCurrencyChange === null || onCurrencyChange === void 0 ? void 0 : onCurrencyChange(option.value);
        }} initiallyFocusedOptionKey={currentCurrency} showScrollIndicator shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch ListItem={RadioListItem_1.default}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
PaymentCardCurrencyModal.displayName = 'PaymentCardCurrencyModal';
exports.default = PaymentCardCurrencyModal;
