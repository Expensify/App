"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var OptionsListUtils = require("@libs/OptionsListUtils");
var ReportFieldOptionsListUtils = require("@libs/ReportFieldOptionsListUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function EditReportFieldDropdownPage(_a) {
    var onSubmit = _a.onSubmit, fieldKey = _a.fieldKey, fieldValue = _a.fieldValue, fieldOptions = _a.fieldOptions;
    var recentlyUsedReportFields = (0, useOnyx_1.default)(ONYXKEYS_1.default.RECENTLY_USED_REPORT_FIELDS)[0];
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var recentlyUsedOptions = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = recentlyUsedReportFields === null || recentlyUsedReportFields === void 0 ? void 0 : recentlyUsedReportFields[fieldKey]) === null || _a === void 0 ? void 0 : _a.sort(LocaleCompare_1.default)) !== null && _b !== void 0 ? _b : []; }, [recentlyUsedReportFields, fieldKey]);
    var itemRightSideComponent = (0, react_1.useCallback)(function (item) {
        if (item.text === fieldValue) {
            return (<Icon_1.default src={Expensicons.Checkmark} fill={theme.iconSuccessFill}/>);
        }
        return null;
    }, [theme.iconSuccessFill, fieldValue]);
    var _c = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        var validFieldOptions = (_a = fieldOptions === null || fieldOptions === void 0 ? void 0 : fieldOptions.filter(function (option) { return !!option; })) === null || _a === void 0 ? void 0 : _a.sort(LocaleCompare_1.default);
        var policyReportFieldOptions = ReportFieldOptionsListUtils.getReportFieldOptionsSection({
            searchValue: debouncedSearchValue,
            selectedOptions: [
                {
                    keyForList: fieldValue,
                    searchText: fieldValue,
                    text: fieldValue,
                },
            ],
            options: validFieldOptions,
            recentlyUsedOptions: recentlyUsedOptions,
        });
        var policyReportFieldData = (_c = (_b = policyReportFieldOptions.at(0)) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : [];
        var header = OptionsListUtils.getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue);
        return [policyReportFieldOptions, header];
    }, [recentlyUsedOptions, debouncedSearchValue, fieldValue, fieldOptions]), sections = _c[0], headerMessage = _c[1];
    var selectedOptionKey = (0, react_1.useMemo)(function () { var _a, _b, _c, _d; return (_d = (_c = ((_b = (_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : []).filter(function (option) { return option.searchText === fieldValue; })) === null || _c === void 0 ? void 0 : _c.at(0)) === null || _d === void 0 ? void 0 : _d.keyForList; }, [sections, fieldValue]);
    return (<SelectionList_1.default textInputValue={searchValue} textInputLabel={translate('common.search')} sections={sections !== null && sections !== void 0 ? sections : []} onSelectRow={function (option) {
        var _a;
        return onSubmit((_a = {}, _a[fieldKey] = !(option === null || option === void 0 ? void 0 : option.text) || fieldValue === option.text ? '' : option.text, _a));
    }} initiallyFocusedOptionKey={selectedOptionKey !== null && selectedOptionKey !== void 0 ? selectedOptionKey : undefined} onChangeText={setSearchValue} headerMessage={headerMessage} ListItem={RadioListItem_1.default} isRowMultilineSupported rightHandSideComponent={itemRightSideComponent}/>);
}
EditReportFieldDropdownPage.displayName = 'EditReportFieldDropdownPage';
exports.default = EditReportFieldDropdownPage;
