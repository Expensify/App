"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var Url_1 = require("@libs/Url");
var CONST_1 = require("@src/CONST");
function CountrySelectionPage(_a) {
    var route = _a.route;
    var _b = (0, react_1.useState)(''), searchValue = _b[0], setSearchValue = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    var currentCountry = route.params.country;
    var countries = (0, react_1.useMemo)(function () {
        return Object.keys(CONST_1.default.ALL_COUNTRIES).map(function (countryISO) {
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
    var searchResults = (0, searchOptions_1.default)(searchValue, countries);
    var headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';
    var selectCountry = (0, react_1.useCallback)(function (option) {
        var _a;
        var backTo = (_a = route.params.backTo) !== null && _a !== void 0 ? _a : '';
        // Check the "backTo" parameter to decide navigation behavior
        if (!backTo) {
            Navigation_1.default.goBack();
        }
        else {
            // Set compareParams to false because we want to go back to this particular screen and update params (country).
            Navigation_1.default.goBack((0, Url_1.appendParam)(backTo, 'country', option.value), { compareParams: false });
        }
    }, [route]);
    return (<ScreenWrapper_1.default testID={CountrySelectionPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('common.country')} shouldShowBackButton onBackButtonPress={function () {
            var _a;
            var backTo = (_a = route.params.backTo) !== null && _a !== void 0 ? _a : '';
            var backToRoute = backTo ? "".concat(backTo, "?country=").concat(currentCountry) : '';
            Navigation_1.default.goBack(backToRoute, { compareParams: false });
        }}/>

            <SelectionList_1.default headerMessage={headerMessage} textInputLabel={translate('common.country')} textInputValue={searchValue} sections={[{ data: searchResults }]} ListItem={RadioListItem_1.default} onSelectRow={selectCountry} shouldSingleExecuteRowSelect onChangeText={setSearchValue} initiallyFocusedOptionKey={currentCountry} shouldUseDynamicMaxToRenderPerBatch addBottomSafeAreaPadding/>
        </ScreenWrapper_1.default>);
}
CountrySelectionPage.displayName = 'CountrySelectionPage';
exports.default = CountrySelectionPage;
