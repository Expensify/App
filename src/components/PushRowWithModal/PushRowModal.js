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
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var CONST_1 = require("@src/CONST");
function PushRowModal(_a) {
    var isVisible = _a.isVisible, selectedOption = _a.selectedOption, onOptionChange = _a.onOptionChange, onClose = _a.onClose, optionsList = _a.optionsList, headerTitle = _a.headerTitle, searchInputTitle = _a.searchInputTitle;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var options = (0, react_1.useMemo)(function () {
        return Object.entries(optionsList).map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                value: key,
                text: value,
                keyForList: key,
                isSelected: key === selectedOption,
                searchValue: StringUtils_1.default.sanitizeString(value),
            });
        });
    }, [optionsList, selectedOption]);
    var handleSelectRow = function (option) {
        onOptionChange(option.value);
        onClose();
    };
    var handleClose = function () {
        onClose();
        setSearchValue('');
    };
    var searchResults = (0, searchOptions_1.default)(debouncedSearchValue, options);
    var headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';
    return (<Modal_1.default onClose={handleClose} isVisible={isVisible} type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} onModalHide={handleClose} shouldUseCustomBackdrop useNativeDriver>
            <ScreenWrapper_1.default includePaddingTop={false} includeSafeAreaPaddingBottom={false} testID={PushRowModal.displayName}>
                <HeaderWithBackButton_1.default title={headerTitle} onBackButtonPress={onClose}/>
                <SelectionList_1.default headerMessage={headerMessage} textInputLabel={searchInputTitle} textInputValue={searchValue} onChangeText={setSearchValue} onSelectRow={handleSelectRow} sections={[{ data: searchResults }]} initiallyFocusedOptionKey={selectedOption} showScrollIndicator shouldShowTooltips={false} ListItem={RadioListItem_1.default}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
PushRowModal.displayName = 'PushRowModal';
exports.default = PushRowModal;
