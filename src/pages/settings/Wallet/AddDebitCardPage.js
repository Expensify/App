"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PaymentCardForm_1 = require("@components/AddPaymentCard/PaymentCardForm");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var PaymentMethods = require("@userActions/PaymentMethods");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DebitCardPage() {
    // Temporarily disabled
    return <NotFoundPage_1.default />;
    var translate = (0, useLocalize_1.default)().translate;
    var formData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM)[0];
    var prevFormDataSetupComplete = (0, usePrevious_1.default)(!!(formData === null || formData === void 0 ? void 0 : formData.setupComplete));
    var nameOnCardRef = (0, react_1.useRef)(null);
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { var _a; return (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : 0; } })[0];
    /**
     * Reset the form values on the mount and unmount so that old errors don't show when this form is displayed again.
     */
    (0, react_1.useEffect)(function () {
        PaymentMethods.clearPaymentCardFormErrorAndSubmit();
        return function () {
            PaymentMethods.clearPaymentCardFormErrorAndSubmit();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        if (prevFormDataSetupComplete || !(formData === null || formData === void 0 ? void 0 : formData.setupComplete)) {
            return;
        }
        PaymentMethods.continueSetup();
    }, [prevFormDataSetupComplete, formData === null || formData === void 0 ? void 0 : formData.setupComplete]);
    var addPaymentCard = (0, react_1.useCallback)(function (params) {
        PaymentMethods.addPaymentCard(accountID !== null && accountID !== void 0 ? accountID : 0, params);
    }, [accountID]);
    return (<ScreenWrapper_1.default onEntryTransitionEnd={function () { var _a; return (_a = nameOnCardRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} includeSafeAreaPaddingBottom={false} testID={DebitCardPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('addDebitCardPage.addADebitCard')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <PaymentCardForm_1.default showAcceptTerms shouldShowPaymentCardForm showAddressField isDebitCard showStateSelector addPaymentCard={addPaymentCard} submitButtonText={translate('common.save')}/>
        </ScreenWrapper_1.default>);
}
DebitCardPage.displayName = 'DebitCardPage';
exports.default = DebitCardPage;
