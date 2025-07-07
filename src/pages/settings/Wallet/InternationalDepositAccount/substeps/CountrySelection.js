"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Text_1 = require("@src/components/Text");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function CountrySelection(_a) {
    var isEditing = _a.isEditing, onNext = _a.onNext, formValues = _a.formValues, resetScreenIndex = _a.resetScreenIndex;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var _c = (0, react_1.useState)(formValues.bankCountry), currentCountry = _c[0], setCurrentCountry = _c[1];
    var onCountrySelected = (0, react_1.useCallback)(function () {
        if (currentCountry === CONST_1.default.COUNTRY.US) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADD_US_BANK_ACCOUNT);
            return;
        }
        if (isEditing && formValues.bankCountry === currentCountry) {
            onNext();
            return;
        }
        (0, BankAccounts_1.fetchCorpayFields)(currentCountry);
        resetScreenIndex === null || resetScreenIndex === void 0 ? void 0 : resetScreenIndex(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
    }, [currentCountry, formValues.bankCountry, isEditing, onNext, resetScreenIndex]);
    var onSelectionChange = (0, react_1.useCallback)(function (country) {
        setCurrentCountry(country.value);
    }, []);
    var countries = (0, react_1.useMemo)(function () {
        return Object.keys(CONST_1.default.ALL_COUNTRIES)
            .filter(function (countryISO) { return !CONST_1.default.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO); })
            .map(function (countryISO) {
            var countryName = translate("allCountries.".concat(countryISO));
            return {
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
                searchValue: StringUtils_1.default.sanitizeString("".concat(countryISO).concat(countryName)),
            };
        });
    }, [translate, currentCountry]);
    var searchResults = (0, searchOptions_1.default)(debouncedSearchValue, countries);
    var headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';
    return (<FullPageOfflineBlockingView_1.default>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.countrySelectionStepHeader')}</Text_1.default>
            </react_native_1.View>
            <SelectionList_1.default headerMessage={headerMessage} sections={[{ data: searchResults }]} textInputValue={searchValue} textInputLabel={translate('common.search')} onChangeText={setSearchValue} onSelectRow={onSelectionChange} onConfirm={onCountrySelected} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={currentCountry} shouldSingleExecuteRowSelect shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch showConfirmButton confirmButtonText={isEditing ? translate('common.confirm') : translate('common.next')} isConfirmButtonDisabled={isOffline} shouldUpdateFocusedIndex/>
        </FullPageOfflineBlockingView_1.default>);
}
CountrySelection.displayName = 'CountrySelection';
exports.default = CountrySelection;
