"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function YearPickerModal(_a) {
    var isVisible = _a.isVisible, years = _a.years, _b = _a.currentYear, currentYear = _b === void 0 ? new Date().getFullYear() : _b, onYearChange = _a.onYearChange, onClose = _a.onClose;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, react_1.useState)(''), searchText = _c[0], setSearchText = _c[1];
    var _d = (0, react_1.useMemo)(function () {
        var yearsList = searchText === '' ? years : years.filter(function (year) { var _a; return (_a = year.text) === null || _a === void 0 ? void 0 : _a.includes(searchText); });
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{ data: yearsList.sort(function (a, b) { return b.value - a.value; }), indexOffset: 0 }],
        };
    }, [years, searchText, translate]), sections = _d.sections, headerMessage = _d.headerMessage;
    (0, react_1.useEffect)(function () {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={function () { return onClose === null || onClose === void 0 ? void 0 : onClose(); }} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver shouldHandleNavigationBack shouldUseCustomBackdrop onBackdropPress={onClose} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={YearPickerModal.displayName}>
                <HeaderWithBackButton_1.default title={translate('yearPickerPage.year')} onBackButtonPress={onClose}/>
                <SelectionList_1.default textInputLabel={translate('yearPickerPage.selectYear')} textInputValue={searchText} textInputMaxLength={4} onChangeText={function (text) { return setSearchText(text.replace(CONST_1.default.REGEX.NON_NUMERIC, '').trim()); }} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} headerMessage={headerMessage} sections={sections} onSelectRow={function (option) {
            react_native_1.Keyboard.dismiss();
            onYearChange === null || onYearChange === void 0 ? void 0 : onYearChange(option.value);
        }} initiallyFocusedOptionKey={currentYear.toString()} showScrollIndicator shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch ListItem={RadioListItem_1.default} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
YearPickerModal.displayName = 'YearPickerModal';
exports.default = YearPickerModal;
