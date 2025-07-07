"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var SelectionList_1 = require("@components/SelectionList");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function CustomCloseDateSelectionList(_a) {
    var initiallySelectedDay = _a.initiallySelectedDay, onConfirmSelectedDay = _a.onConfirmSelectedDay;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(initiallySelectedDay), selectedDay = _b[0], setSelectedDay = _b[1];
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var _d = (0, react_1.useState)(undefined), error = _d[0], setError = _d[1];
    var sections = (0, react_1.useMemo)(function () {
        var data = CONST_1.default.DATE.MONTH_DAYS.reduce(function (days, dayValue) {
            var day = {
                value: dayValue,
                text: dayValue.toString(),
                keyForList: dayValue.toString(),
                isSelected: dayValue === selectedDay,
            };
            if (debouncedSearchValue) {
                if (day.text.includes(debouncedSearchValue)) {
                    days.push(day);
                }
            }
            else {
                days.push(day);
            }
            return days;
        }, []);
        return [{ data: data, indexOffset: 0 }];
    }, [selectedDay, debouncedSearchValue]);
    var selectDayAndClearError = (0, react_1.useCallback)(function (item) {
        setSelectedDay(item.value);
        setError(undefined);
    }, []);
    var confirmSelectedDay = (0, react_1.useCallback)(function () {
        if (!selectedDay) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }
        onConfirmSelectedDay(selectedDay);
    }, [selectedDay, onConfirmSelectedDay, translate]);
    return (<SelectionList_1.default ListItem={SingleSelectListItem_1.default} onSelectRow={selectDayAndClearError} shouldShowListEmptyContent={false} sections={sections} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={initiallySelectedDay === null || initiallySelectedDay === void 0 ? void 0 : initiallySelectedDay.toString()} shouldUpdateFocusedIndex showConfirmButton confirmButtonText={translate('common.save')} onConfirm={confirmSelectedDay} confirmButtonStyles={styles.mt3} addBottomSafeAreaPadding shouldShowTextInput textInputLabel={translate('common.search')} textInputValue={searchValue} onChangeText={setSearchValue}>
            {!!error && (<FormHelpMessage_1.default style={[styles.ph5]} isError message={error}/>)}
        </SelectionList_1.default>);
}
CustomCloseDateSelectionList.displayName = 'CustomCloseDateSelectionList';
exports.default = CustomCloseDateSelectionList;
