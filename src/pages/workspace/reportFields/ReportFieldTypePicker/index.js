"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var WorkspaceReportFieldUtils = require("@libs/WorkspaceReportFieldUtils");
var CONST_1 = require("@src/CONST");
function ReportFieldTypePicker(_a) {
    var _b, _c, _d;
    var defaultValue = _a.defaultValue, onOptionSelected = _a.onOptionSelected;
    var translate = (0, useLocalize_1.default)().translate;
    var typeSections = (0, react_1.useMemo)(function () {
        var data = Object.values(CONST_1.default.REPORT_FIELD_TYPES).map(function (reportFieldType) { return ({
            keyForList: reportFieldType,
            value: reportFieldType,
            isSelected: defaultValue === reportFieldType,
            text: translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(reportFieldType)),
            alternateText: translate(WorkspaceReportFieldUtils.getReportFieldAlternativeTextTranslationKey(reportFieldType)),
        }); });
        return [{ data: data }];
    }, [defaultValue, translate]);
    return (<SelectionList_1.default sections={typeSections} ListItem={RadioListItem_1.default} onSelectRow={onOptionSelected} addBottomSafeAreaPadding initiallyFocusedOptionKey={(_d = (_c = (_b = typeSections.at(0)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.find(function (reportField) { return reportField.isSelected; })) === null || _d === void 0 ? void 0 : _d.keyForList}/>);
}
ReportFieldTypePicker.displayName = 'ReportFieldTypePicker';
exports.default = ReportFieldTypePicker;
