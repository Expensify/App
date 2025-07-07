"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchAdvancedFiltersForm_1 = require("@src/types/form/SearchAdvancedFiltersForm");
function SearchFiltersMerchantPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var merchant = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm[SearchAdvancedFiltersForm_1.default.MERCHANT];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var updateMerchantFilter = function (values) {
        (0, Search_1.updateAdvancedFilters)(values);
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    };
    var validate = function (values) {
        var errors = {};
        var merchantValue = values.merchant.trim();
        var _a = (0, ValidationUtils_1.isValidInputLength)(merchantValue, CONST_1.default.MERCHANT_NAME_MAX_BYTES), isValid = _a.isValid, byteLength = _a.byteLength;
        if (!isValid) {
            errors.merchant = translate('common.error.characterLimitExceedCounter', { length: byteLength, limit: CONST_1.default.MERCHANT_NAME_MAX_BYTES });
        }
        return errors;
    };
    return (<ScreenWrapper_1.default testID={SearchFiltersMerchantPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.merchant')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <FormProvider_1.default style={[styles.flex1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM} validate={validate} onSubmit={updateMerchantFilter} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                <react_native_1.View style={styles.mb5}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SearchAdvancedFiltersForm_1.default.MERCHANT} name={SearchAdvancedFiltersForm_1.default.MERCHANT} defaultValue={merchant} label={translate('common.merchant')} accessibilityLabel={translate('common.merchant')} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersMerchantPage.displayName = 'SearchFiltersMerchantPage';
exports.default = SearchFiltersMerchantPage;
