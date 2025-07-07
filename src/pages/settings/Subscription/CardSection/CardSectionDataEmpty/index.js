"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function CardSectionDataEmpty() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _a.isActingAsDelegate, showDelegateNoAccessModal = _a.showDelegateNoAccessModal;
    var openAddPaymentCardScreen = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, []);
    var handleAddPaymentCardPress = function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        openAddPaymentCardScreen();
    };
    return (<Button_1.default text={translate('subscription.cardSection.addCardButton')} onPress={handleAddPaymentCardPress} style={styles.w100} success large/>);
}
CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';
exports.default = CardSectionDataEmpty;
