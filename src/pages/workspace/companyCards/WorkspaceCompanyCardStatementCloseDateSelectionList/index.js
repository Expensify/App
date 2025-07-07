"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FixedFooter_1 = require("@components/FixedFooter");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SingleSelectListItem_1 = require("@components/SelectionList/SingleSelectListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var CustomCloseDateSelectionList_1 = require("./CustomCloseDateSelectionList");
function WorkspaceCompanyCardStatementCloseDateSelectionList(_a) {
    var _b;
    var confirmText = _a.confirmText, onSubmit = _a.onSubmit, onBackButtonPress = _a.onBackButtonPress, enabledWhenOffline = _a.enabledWhenOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(undefined), selectedDate = _c[0], setSelectedDate = _c[1];
    var _d = (0, react_1.useState)(undefined), selectedCustomDate = _d[0], setSelectedCustomDate = _d[1];
    var _e = (0, react_1.useState)(undefined), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), isChoosingCustomDate = _f[0], setIsChoosingCustomDate = _f[1];
    var title = (0, react_1.useMemo)(function () { return (isChoosingCustomDate ? translate('workspace.companyCards.customCloseDate') : translate('workspace.moreFeatures.companyCards.statementCloseDateTitle')); }, [translate, isChoosingCustomDate]);
    var goBack = (0, react_1.useCallback)(function () {
        if (isChoosingCustomDate) {
            setIsChoosingCustomDate(false);
            return;
        }
        onBackButtonPress();
    }, [isChoosingCustomDate, onBackButtonPress]);
    var selectDateAndClearError = (0, react_1.useCallback)(function (item) {
        setSelectedDate(item.value);
        setError(undefined);
    }, []);
    var selectCustomDateAndClearError = (0, react_1.useCallback)(function (day) {
        setSelectedCustomDate(day);
        setError(undefined);
        goBack();
    }, [goBack]);
    var submit = (0, react_1.useCallback)(function () {
        if (!selectedDate || (selectedDate === CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && !selectedCustomDate)) {
            setError(translate('workspace.moreFeatures.companyCards.error.statementCloseDateRequired'));
            return;
        }
        onSubmit(selectedDate, selectedDate === CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH ? selectedCustomDate : undefined);
    }, [selectedDate, selectedCustomDate, onSubmit, translate]);
    return (<ScreenWrapper_1.default testID={WorkspaceCompanyCardStatementCloseDateSelectionList.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={title} onBackButtonPress={goBack}/>
            {isChoosingCustomDate ? (<CustomCloseDateSelectionList_1.default initiallySelectedDay={selectedCustomDate} onConfirmSelectedDay={selectCustomDateAndClearError}/>) : (<>
                    <ScrollView_1.default contentContainerStyle={[styles.gap7, styles.flexGrow1]}>
                        <Text_1.default style={[styles.ph5]}>{translate('workspace.moreFeatures.companyCards.statementCloseDateDescription')}</Text_1.default>
                        <react_native_1.View>
                            {(_b = Object.values(CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE)) === null || _b === void 0 ? void 0 : _b.map(function (option) { return (<SingleSelectListItem_1.default wrapperStyle={[styles.flexReset]} key={option} showTooltip item={{
                    value: option,
                    text: translate("workspace.companyCards.statementCloseDate.".concat(option)),
                    isSelected: selectedDate === option,
                }} onSelectRow={selectDateAndClearError}/>); })}
                            {selectedDate === CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH && (<MenuItemWithTopDescription_1.default shouldShowRightIcon brickRoadIndicator={error ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} title={selectedCustomDate === null || selectedCustomDate === void 0 ? void 0 : selectedCustomDate.toString()} description={translate('workspace.companyCards.customCloseDate')} onPress={function () { return setIsChoosingCustomDate(true); }} viewMode={CONST_1.default.OPTION_MODE.COMPACT}/>)}
                        </react_native_1.View>
                    </ScrollView_1.default>
                    <FixedFooter_1.default style={styles.gap3} addBottomSafeAreaPadding>
                        {!!error && (<FormHelpMessage_1.default isError message={error}/>)}
                        <FormAlertWithSubmitButton_1.default buttonText={confirmText} onSubmit={submit} enabledWhenOffline={enabledWhenOffline}/>
                    </FixedFooter_1.default>
                </>)}
        </ScreenWrapper_1.default>);
}
WorkspaceCompanyCardStatementCloseDateSelectionList.displayName = 'WorkspaceCompanyCardStatementCloseDateSelectionList';
exports.default = WorkspaceCompanyCardStatementCloseDateSelectionList;
