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
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchAdvancedFiltersForm_1 = require("@src/types/form/SearchAdvancedFiltersForm");
function SearchFiltersTitlePage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: false })[0];
    var title = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm[SearchAdvancedFiltersForm_1.default.TITLE];
    var updateTitleFilter = function (values) {
        (0, Search_1.updateAdvancedFilters)(values);
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    };
    var validate = function (values) {
        var errors = {};
        var titleValue = values.title.trim();
        if (titleValue.length > CONST_1.default.TASK_TITLE_CHARACTER_LIMIT) {
            errors.title = translate('common.error.characterLimitExceedCounter', { length: titleValue.length, limit: CONST_1.default.TASK_TITLE_CHARACTER_LIMIT });
        }
        return errors;
    };
    return (<ScreenWrapper_1.default testID={SearchFiltersTitlePage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.title')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <FormProvider_1.default style={[styles.flex1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM} validate={validate} onSubmit={updateTitleFilter} submitButtonText={translate('common.save')} enabledWhenOffline>
                <react_native_1.View style={styles.mb5}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SearchAdvancedFiltersForm_1.default.TITLE} name={SearchAdvancedFiltersForm_1.default.TITLE} defaultValue={title} label={translate('common.title')} accessibilityLabel={translate('common.title')} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersTitlePage.displayName = 'SearchFiltersTitlePage';
exports.default = SearchFiltersTitlePage;
