"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var OptionsListUtils = require("@libs/OptionsListUtils");
var PerDiemRequestUtils = require("@libs/PerDiemRequestUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SelectionList_1 = require("./SelectionList");
var RadioListItem_1 = require("./SelectionList/RadioListItem");
function DestinationPicker(_a) {
    var selectedDestination = _a.selectedDestination, policyID = _a.policyID, onSubmit = _a.onSubmit;
    var policy = (0, usePolicy_1.default)(policyID);
    var customUnit = PolicyUtils.getPerDiemCustomUnit(policy);
    var policyRecentlyUsedDestinations = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS).concat(policyID))[0];
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var selectedOptions = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if (!selectedDestination) {
            return [];
        }
        var selectedRate = (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _a === void 0 ? void 0 : _a[selectedDestination];
        if (!(selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.customUnitRateID)) {
            return [];
        }
        return [
            {
                rateID: selectedRate.customUnitRateID,
                name: (_b = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name) !== null && _b !== void 0 ? _b : '',
                currency: (_c = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD,
                isSelected: true,
            },
        ];
    }, [customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates, selectedDestination]);
    var _c = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        var destinationOptions = PerDiemRequestUtils.getDestinationListSections({
            searchValue: debouncedSearchValue,
            selectedOptions: selectedOptions,
            destinations: Object.values((_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _a !== void 0 ? _a : {}),
            recentlyUsedDestinations: policyRecentlyUsedDestinations,
        });
        var destinationData = (_c = (_b = destinationOptions === null || destinationOptions === void 0 ? void 0 : destinationOptions.at(0)) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : [];
        var header = OptionsListUtils.getHeaderMessageForNonUserList(destinationData.length > 0, debouncedSearchValue);
        var destinationsCount = Object.values((_d = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _d !== void 0 ? _d : {}).length;
        var isDestinationsCountBelowThreshold = destinationsCount < CONST_1.default.STANDARD_LIST_ITEM_LIMIT;
        var showInput = !isDestinationsCountBelowThreshold;
        return [destinationOptions, header, showInput];
    }, [debouncedSearchValue, selectedOptions, customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates, policyRecentlyUsedDestinations]), sections = _c[0], headerMessage = _c[1], shouldShowTextInput = _c[2];
    var selectedOptionKey = (0, react_1.useMemo)(function () { var _a, _b, _c; return (_c = ((_b = (_a = sections === null || sections === void 0 ? void 0 : sections.at(0)) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : []).filter(function (destination) { return destination.keyForList === selectedDestination; }).at(0)) === null || _c === void 0 ? void 0 : _c.keyForList; }, [sections, selectedDestination]);
    return (<SelectionList_1.default sections={sections} headerMessage={headerMessage} textInputValue={searchValue} textInputLabel={shouldShowTextInput ? translate('common.search') : undefined} onChangeText={setSearchValue} onSelectRow={onSubmit} ListItem={RadioListItem_1.default} initiallyFocusedOptionKey={selectedOptionKey !== null && selectedOptionKey !== void 0 ? selectedOptionKey : undefined} isRowMultilineSupported/>);
}
DestinationPicker.displayName = 'DestinationPicker';
exports.default = DestinationPicker;
