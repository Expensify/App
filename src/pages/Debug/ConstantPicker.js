"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isObject_1 = require("lodash/isObject");
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var const_1 = require("./const");
function ConstantPicker(_a) {
    var formType = _a.formType, fieldName = _a.fieldName, fieldValue = _a.fieldValue, onSubmit = _a.onSubmit;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(''), searchValue = _b[0], setSearchValue = _b[1];
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b;
        return Object.entries((_b = (_a = const_1.DETAILS_CONSTANT_FIELDS[formType].find(function (field) { return field.fieldName === fieldName; })) === null || _a === void 0 ? void 0 : _a.options) !== null && _b !== void 0 ? _b : {})
            .reduce(function (acc, _a) {
            var key = _a[0], value = _a[1];
            // Option has multiple constants, so we need to flatten these into separate options
            if ((0, isObject_1.default)(value)) {
                acc.push.apply(acc, Object.entries(value));
                return acc;
            }
            acc.push([key, String(value)]);
            return acc;
        }, [])
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                text: value,
                keyForList: key,
                isSelected: value === fieldValue,
                searchText: value,
            });
        })
            .filter(function (_a) {
            var searchText = _a.searchText;
            return (0, tokenizedSearch_1.default)([{ searchText: searchText }], searchValue, function (item) { return [item.searchText]; }).length > 0;
        });
    }, [fieldName, fieldValue, formType, searchValue]);
    var selectedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = sections.filter(function (option) { return option.searchText === fieldValue; }).at(0)) === null || _a === void 0 ? void 0 : _a.keyForList; }, [sections, fieldValue]);
    return (<SelectionList_1.default sections={[{ data: sections }]} textInputValue={searchValue} textInputLabel={translate('common.search')} onChangeText={setSearchValue} onSelectRow={onSubmit} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={selectedOptionKey !== null && selectedOptionKey !== void 0 ? selectedOptionKey : undefined} isRowMultilineSupported/>);
}
ConstantPicker.default = 'ConstantPicker';
exports.default = ConstantPicker;
