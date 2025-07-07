"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var WorkspacesSettingsUtils_1 = require("@libs/WorkspacesSettingsUtils");
var CONST_1 = require("@src/CONST");
var SelectionList_1 = require("./SelectionList");
var RadioListItem_1 = require("./SelectionList/RadioListItem");
var units = [CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS, CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES];
function UnitPicker(_a) {
    var _b;
    var defaultValue = _a.defaultValue, onOptionSelected = _a.onOptionSelected;
    var translate = (0, useLocalize_1.default)().translate;
    var unitOptions = (0, react_1.useMemo)(function () {
        return units.map(function (unit) { return ({
            value: unit,
            text: expensify_common_1.Str.recapitalize(translate((0, WorkspacesSettingsUtils_1.getUnitTranslationKey)(unit))),
            keyForList: unit,
            isSelected: defaultValue === unit,
        }); });
    }, [defaultValue, translate]);
    return (<SelectionList_1.default sections={[{ data: unitOptions }]} ListItem={RadioListItem_1.default} onSelectRow={onOptionSelected} initiallyFocusedOptionKey={(_b = unitOptions.find(function (unit) { return unit.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList}/>);
}
exports.default = UnitPicker;
