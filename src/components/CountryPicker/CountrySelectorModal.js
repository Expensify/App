"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var CONST_1 = require("@src/CONST");
function CountrySelectorModal(_a) {
    var isVisible = _a.isVisible, currentCountry = _a.currentCountry, onCountrySelected = _a.onCountrySelected, onClose = _a.onClose, label = _a.label, onBackdropPress = _a.onBackdropPress;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
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
    var searchResults = (0, searchOptions_1.default)(debouncedSearchValue, countries);
    var headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver onBackdropPress={onBackdropPress}>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} includeSafeAreaPaddingBottom={false} testID={CountrySelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <SelectionList_1.default headerMessage={headerMessage} sections={[{ data: searchResults }]} textInputValue={searchValue} textInputLabel={translate('common.search')} onChangeText={setSearchValue} onSelectRow={onCountrySelected} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={currentCountry} shouldSingleExecuteRowSelect shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
CountrySelectorModal.displayName = 'CountrySelectorModal';
exports.default = CountrySelectorModal;
