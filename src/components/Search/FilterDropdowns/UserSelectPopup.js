"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SelectionList_1 = require("@components/SelectionList");
var UserSelectionListItem_1 = require("@components/SelectionList/Search/UserSelectionListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getSelectedOptionData(option) {
    return __assign(__assign({}, option), { reportID: "".concat(option.reportID), selected: true });
}
function UserSelectPopup(_a) {
    var value = _a.value, closeOverlay = _a.closeOverlay, onChange = _a.onChange;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var options = (0, OptionListContextProvider_1.useOptionsList)().options;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true, selector: function (onyxSession) { return onyxSession === null || onyxSession === void 0 ? void 0 : onyxSession.accountID; } })[0];
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var _c = (0, react_1.useState)(function () {
        return value.reduce(function (acc, id) {
            var participant = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[id];
            if (!participant) {
                return acc;
            }
            var optionData = getSelectedOptionData(participant);
            if (optionData) {
                acc.push(optionData);
            }
            return acc;
        }, []);
    }), selectedOptions = _c[0], setSelectedOptions = _c[1];
    var cleanSearchTerm = searchTerm.trim().toLowerCase();
    // Get a list of all options/personal details and filter them by the current search term
    var listData = (0, react_1.useMemo)(function () {
        var optionsList = (0, OptionsListUtils_1.getValidOptions)({
            reports: options.reports,
            personalDetails: options.personalDetails,
        }, {
            selectedOptions: selectedOptions,
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            includeSelectedOptions: true,
            includeCurrentUser: true,
        });
        var _a = (0, OptionsListUtils_1.filterAndOrderOptions)(optionsList, cleanSearchTerm, {
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        }), filteredOptionsList = _a.personalDetails, recentReports = _a.recentReports;
        var personalDetailList = filteredOptionsList
            .map(function (participant) { return (__assign(__assign({}, participant), { isSelected: selectedOptions.some(function (selectedOption) { return selectedOption.accountID === participant.accountID; }) })); })
            .sort(function (a, b) {
            // Put the current user at the top of the list
            if (a.accountID === accountID) {
                return -1;
            }
            if (b.accountID === accountID) {
                return 1;
            }
            return 0;
        });
        return __spreadArray(__spreadArray([], (personalDetailList !== null && personalDetailList !== void 0 ? personalDetailList : []), true), (recentReports !== null && recentReports !== void 0 ? recentReports : []), true);
    }, [cleanSearchTerm, options.personalDetails, options.reports, selectedOptions, accountID]);
    var _d = (0, react_1.useMemo)(function () {
        var newSections = [
            {
                title: '',
                data: listData,
                shouldShow: !(0, isEmpty_1.default)(listData),
            },
        ];
        var noResultsFound = (0, isEmpty_1.default)(listData);
        var message = noResultsFound ? translate('common.noResultsFound') : undefined;
        return {
            sections: newSections,
            headerMessage: message,
        };
    }, [listData, translate]), sections = _d.sections, headerMessage = _d.headerMessage;
    var selectUser = (0, react_1.useCallback)(function (option) {
        var optionIndex = selectedOptions.findIndex(function (selectedOption) {
            var matchesAccountID = selectedOption.accountID && selectedOption.accountID === (option === null || option === void 0 ? void 0 : option.accountID);
            var matchesReportID = selectedOption.reportID && selectedOption.reportID === (option === null || option === void 0 ? void 0 : option.reportID);
            // Below is just a boolean expression.
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return matchesAccountID || matchesReportID;
        });
        if (optionIndex === -1) {
            setSelectedOptions(__spreadArray(__spreadArray([], selectedOptions, true), [getSelectedOptionData(option)], false));
        }
        else {
            var newSelectedOptions = __spreadArray(__spreadArray([], selectedOptions.slice(0, optionIndex), true), selectedOptions.slice(optionIndex + 1), true);
            setSelectedOptions(newSelectedOptions);
        }
    }, [selectedOptions]);
    var applyChanges = (0, react_1.useCallback)(function () {
        var accountIDs = selectedOptions.map(function (option) { return (option.accountID ? option.accountID.toString() : undefined); }).filter(Boolean);
        closeOverlay();
        onChange(accountIDs);
    }, [closeOverlay, onChange, selectedOptions]);
    var resetChanges = (0, react_1.useCallback)(function () {
        onChange([]);
        closeOverlay();
    }, [closeOverlay, onChange]);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);
    var isLoadingNewOptions = !!isSearchingForReports;
    var dataLength = sections.flatMap(function (section) { return section.data; }).length;
    return (<react_native_1.View style={[styles.getUserSelectionListPopoverHeight(dataLength || 1, windowHeight, shouldUseNarrowLayout)]}>
            <SelectionList_1.default canSelectMultiple textInputAutoFocus shouldClearInputOnSelect={false} headerMessage={headerMessage} sections={sections} ListItem={UserSelectionListItem_1.default} containerStyle={[!shouldUseNarrowLayout && styles.pt4]} contentContainerStyle={[styles.pb2]} textInputLabel={translate('selectionList.searchForSomeone')} textInputValue={searchTerm} onSelectRow={selectUser} onChangeText={setSearchTerm} isLoadingNewOptions={isLoadingNewOptions}/>

            <react_native_1.View style={[styles.flexRow, styles.gap2, styles.mh5, !shouldUseNarrowLayout && styles.mb4]}>
                <Button_1.default medium style={[styles.flex1]} text={translate('common.reset')} onPress={resetChanges}/>
                <Button_1.default success medium style={[styles.flex1]} text={translate('common.apply')} onPress={applyChanges}/>
            </react_native_1.View>
        </react_native_1.View>);
}
UserSelectPopup.displayName = 'UserSelectPopup';
exports.default = (0, react_1.memo)(UserSelectPopup);
