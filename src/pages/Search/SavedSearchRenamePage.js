"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchSavedSearchRenameForm_1 = require("@src/types/form/SearchSavedSearchRenameForm");
function SavedSearchRenamePage(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = route.params, q = _b.q, name = _b.name;
    var _c = (0, react_1.useState)(name), newName = _c[0], setNewName = _c[1];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var applyFiltersAndNavigate = function () {
        (0, Search_1.clearAdvancedFilters)();
        Navigation_1.default.dismissModal();
        Navigation_1.default.isNavigationReady().then(function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({
                query: q,
                name: newName === null || newName === void 0 ? void 0 : newName.trim(),
            }));
        });
    };
    var onSaveSearch = function () {
        var _a;
        var queryJSON = (_a = (0, SearchQueryUtils_1.buildSearchQueryJSON)(q || (0, SearchQueryUtils_1.buildCannedSearchQuery)())) !== null && _a !== void 0 ? _a : {};
        (0, Search_1.saveSearch)({
            queryJSON: queryJSON,
            newName: (newName === null || newName === void 0 ? void 0 : newName.trim()) || q,
        });
        applyFiltersAndNavigate();
    };
    return (<ScreenWrapper_1.default testID={SavedSearchRenamePage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} includeSafeAreaPaddingBottom>
            <HeaderWithBackButton_1.default title={translate('common.rename')}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.SEARCH_SAVED_SEARCH_RENAME_FORM} submitButtonText={translate('common.save')} onSubmit={onSaveSearch} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={SearchSavedSearchRenameForm_1.default.NAME} label={translate('search.searchName')} accessibilityLabel={translate('search.searchName')} role={CONST_1.default.ROLE.PRESENTATION} onChangeText={function (renamedName) { return setNewName(renamedName); }} ref={inputCallbackRef} defaultValue={name}/>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
SavedSearchRenamePage.displayName = 'SavedSearchRenamePage';
exports.default = SavedSearchRenamePage;
