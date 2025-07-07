"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportFieldOptionsSection = getReportFieldOptionsSection;
exports.getReportFieldOptions = getReportFieldOptions;
var Localize_1 = require("./Localize");
var tokenizedSearch_1 = require("./tokenizedSearch");
/**
 * Transforms the provided report field options into option objects.
 *
 * @param reportFieldOptions - an initial report field options array
 */
function getReportFieldOptions(reportFieldOptions) {
    return reportFieldOptions.map(function (name) { return ({
        text: name,
        keyForList: name,
        searchText: name,
        tooltipText: name,
        isDisabled: false,
    }); });
}
/**
 * Build the section list for report field options
 */
function getReportFieldOptionsSection(_a) {
    var options = _a.options, recentlyUsedOptions = _a.recentlyUsedOptions, selectedOptions = _a.selectedOptions, searchValue = _a.searchValue;
    var reportFieldOptionsSections = [];
    var selectedOptionKeys = selectedOptions.map(function (_a) {
        var _b, _c;
        var text = _a.text, keyForList = _a.keyForList, name = _a.name;
        return (_c = (_b = text !== null && text !== void 0 ? text : keyForList) !== null && _b !== void 0 ? _b : name) !== null && _c !== void 0 ? _c : '';
    }).filter(function (o) { return !!o; });
    var indexOffset = 0;
    if (searchValue) {
        var searchOptions = (0, tokenizedSearch_1.default)(options, searchValue, function (option) { return [option]; });
        reportFieldOptionsSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            indexOffset: indexOffset,
            data: getReportFieldOptions(searchOptions),
        });
        return reportFieldOptionsSections;
    }
    var filteredRecentlyUsedOptions = recentlyUsedOptions.filter(function (recentlyUsedOption) { return !selectedOptionKeys.includes(recentlyUsedOption); });
    var filteredOptions = options.filter(function (option) { return !selectedOptionKeys.includes(option); });
    if (selectedOptionKeys.length) {
        reportFieldOptionsSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            indexOffset: indexOffset,
            data: getReportFieldOptions(selectedOptionKeys),
        });
        indexOffset += selectedOptionKeys.length;
    }
    if (filteredRecentlyUsedOptions.length > 0) {
        reportFieldOptionsSections.push({
            // "Recent" section
            title: (0, Localize_1.translateLocal)('common.recent'),
            shouldShow: true,
            indexOffset: indexOffset,
            data: getReportFieldOptions(filteredRecentlyUsedOptions),
        });
        indexOffset += filteredRecentlyUsedOptions.length;
    }
    reportFieldOptionsSections.push({
        // "All" section when items amount more than the threshold
        title: (0, Localize_1.translateLocal)('common.all'),
        shouldShow: true,
        indexOffset: indexOffset,
        data: getReportFieldOptions(filteredOptions),
    });
    return reportFieldOptionsSections;
}
