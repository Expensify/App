"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var LocaleCompare_1 = require("@libs/LocaleCompare");
function ReportFieldsInitialListValuePicker(_a) {
    var _b, _c, _d;
    var listValues = _a.listValues, disabledOptions = _a.disabledOptions, value = _a.value, onValueChange = _a.onValueChange;
    var listValueSections = (0, react_1.useMemo)(function () { return [
        {
            data: Object.values(listValues !== null && listValues !== void 0 ? listValues : {})
                .filter(function (listValue, index) { return !disabledOptions.at(index); })
                .sort(LocaleCompare_1.default)
                .map(function (listValue) { return ({
                keyForList: listValue,
                value: listValue,
                isSelected: value === listValue,
                text: listValue,
            }); }),
        },
    ]; }, [value, listValues, disabledOptions]);
    return (<SelectionList_1.default sections={listValueSections} ListItem={RadioListItem_1.default} onSelectRow={function (item) { return onValueChange(item.value); }} initiallyFocusedOptionKey={(_d = (_c = (_b = listValueSections.at(0)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.find(function (listValue) { return listValue.isSelected; })) === null || _d === void 0 ? void 0 : _d.keyForList} addBottomSafeAreaPadding/>);
}
ReportFieldsInitialListValuePicker.displayName = 'ReportFieldsInitialListValuePicker';
exports.default = ReportFieldsInitialListValuePicker;
