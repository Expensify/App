"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
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
function SearchFiltersKeywordPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM)[0];
    var keyword = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm[SearchAdvancedFiltersForm_1.default.KEYWORD];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var updateKeywordFilter = function (values) {
        (0, Search_1.updateAdvancedFilters)(values);
        Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
    };
    return (<ScreenWrapper_1.default testID={SearchFiltersKeywordPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <FullPageNotFoundView_1.default shouldShow={false}>
                <HeaderWithBackButton_1.default title={translate('search.filters.keyword')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
                <FormProvider_1.default style={[styles.flex1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM} onSubmit={updateKeywordFilter} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SearchAdvancedFiltersForm_1.default.KEYWORD} name={SearchAdvancedFiltersForm_1.default.KEYWORD} defaultValue={keyword} label={translate('search.filters.keyword')} accessibilityLabel={translate('search.filters.keyword')} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SearchFiltersKeywordPage.displayName = 'SearchFiltersKeywordPage';
exports.default = SearchFiltersKeywordPage;
