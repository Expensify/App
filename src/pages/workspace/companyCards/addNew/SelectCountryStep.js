"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var Navigation_1 = require("@navigation/Navigation");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function SelectCountryStep(_a) {
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(policyID);
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _b === void 0 ? {} : _b;
    var countryByIp = (0, useOnyx_1.default)(ONYXKEYS_1.default.COUNTRY, { canBeMissing: false })[0];
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var getCountry = (0, react_1.useCallback)(function () {
        var _a;
        if ((_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.selectedCountry) {
            return addNewCard.data.selectedCountry;
        }
        return (0, CardUtils_1.getPlaidCountry)(policy === null || policy === void 0 ? void 0 : policy.outputCurrency, currencyList, countryByIp);
    }, [addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedCountry, countryByIp, currencyList, policy === null || policy === void 0 ? void 0 : policy.outputCurrency]);
    var _d = (0, react_1.useState)(getCountry), currentCountry = _d[0], setCurrentCountry = _d[1];
    var _e = (0, react_1.useState)(false), hasError = _e[0], setHasError = _e[1];
    var doesCountrySupportPlaid = (0, CardUtils_1.isPlaidSupportedCountry)(currentCountry);
    var submit = function () {
        if (!currentCountry) {
            setHasError(true);
        }
        else {
            if ((addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.selectedCountry) !== currentCountry) {
                (0, CompanyCards_1.clearAddNewCardFlow)();
            }
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                step: doesCountrySupportPlaid ? CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE : CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE,
                data: {
                    selectedCountry: currentCountry,
                    selectedFeedType: doesCountrySupportPlaid ? CONST_1.default.COMPANY_CARDS.FEED_TYPE.DIRECT : CONST_1.default.COMPANY_CARDS.FEED_TYPE.CUSTOM,
                },
                isEditing: false,
            });
        }
    };
    (0, react_1.useEffect)(function () {
        setCurrentCountry(getCountry());
    }, [getCountry]);
    var handleBackButtonPress = function () {
        var _a;
        if ((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.backTo) {
            Navigation_1.default.navigate(route.params.backTo);
            return;
        }
        Navigation_1.default.goBack();
    };
    var onSelectionChange = (0, react_1.useCallback)(function (country) {
        setCurrentCountry(country.value);
    }, []);
    var countries = (0, react_1.useMemo)(function () {
        return Object.keys(CONST_1.default.ALL_COUNTRIES)
            .filter(function (countryISO) { return !CONST_1.default.PLAID_EXCLUDED_COUNTRIES.includes(countryISO); })
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
    return (<ScreenWrapper_1.default testID={SelectCountryStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>

            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.addNewCard.whereIsYourBankLocated')}</Text_1.default>
            <SelectionList_1.default headerMessage={headerMessage} sections={[{ data: searchResults }]} textInputValue={searchValue} textInputLabel={translate('common.search')} onChangeText={setSearchValue} onSelectRow={onSelectionChange} onConfirm={submit} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={currentCountry} shouldSingleExecuteRowSelect shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch showConfirmButton addBottomSafeAreaPadding confirmButtonText={translate('common.next')} shouldUpdateFocusedIndex>
                {hasError && (<react_native_1.View style={[styles.ph3, styles.mb3]}>
                        <FormHelpMessage_1.default isError={hasError} message={translate('workspace.companyCards.addNewCard.error.pleaseSelectCountry')}/>
                    </react_native_1.View>)}
            </SelectionList_1.default>
        </ScreenWrapper_1.default>);
}
SelectCountryStep.displayName = 'SelectCountryStep';
exports.default = SelectCountryStep;
