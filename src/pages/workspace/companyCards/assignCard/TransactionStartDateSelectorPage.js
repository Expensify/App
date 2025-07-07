"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var AssignCardForm_1 = require("@src/types/form/AssignCardForm");
function TransactionStartDateSelectorPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD)[0];
    var startDate = (_d = (_b = assignCard === null || assignCard === void 0 ? void 0 : assignCard.startDate) !== null && _b !== void 0 ? _b : (_c = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _c === void 0 ? void 0 : _c.startDate) !== null && _d !== void 0 ? _d : (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING);
    var policyID = route.params.policyID;
    var validate = function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, [AssignCardForm_1.default.START_DATE]);
    };
    var goBack = function () {
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, route.params.feed, route.params.backTo));
    };
    var submit = function (values) {
        (0, CompanyCards_1.setTransactionStartDate)(values[AssignCardForm_1.default.START_DATE]);
        goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default style={styles.pb0} testID={TransactionStartDateSelectorPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('common.date')} shouldShowBackButton onBackButtonPress={goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ASSIGN_CARD_FORM} submitButtonText={translate('common.save')} onSubmit={submit} style={[styles.flexGrow1, styles.ph5]} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={AssignCardForm_1.default.START_DATE} minDate={CONST_1.default.CALENDAR_PICKER.MIN_DATE} maxDate={new Date()} defaultValue={startDate} autoFocus/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
TransactionStartDateSelectorPage.displayName = 'TransactionStartDateSelectorPage';
exports.default = TransactionStartDateSelectorPage;
