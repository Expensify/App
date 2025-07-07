"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var searchOptions_1 = require("@libs/searchOptions");
var StringUtils_1 = require("@libs/StringUtils");
var Url_1 = require("@libs/Url");
function StateSelectionPage() {
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, react_1.useState)(''), searchValue = _a[0], setSearchValue = _a[1];
    var params = route.params;
    var currentState = params === null || params === void 0 ? void 0 : params.state;
    var label = params === null || params === void 0 ? void 0 : params.label;
    var countryStates = (0, react_1.useMemo)(function () {
        return Object.keys(expensify_common_1.CONST.STATES).map(function (state) {
            var stateName = translate("allStates.".concat(state, ".stateName"));
            var stateISO = translate("allStates.".concat(state, ".stateISO"));
            return {
                value: stateISO,
                keyForList: stateISO,
                text: stateName,
                isSelected: currentState === stateISO,
                searchValue: StringUtils_1.default.sanitizeString("".concat(stateISO).concat(stateName)),
            };
        });
    }, [translate, currentState]);
    var searchResults = (0, searchOptions_1.default)(searchValue, countryStates);
    var headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';
    var selectCountryState = (0, react_1.useCallback)(function (option) {
        var _a;
        var backTo = (_a = params === null || params === void 0 ? void 0 : params.backTo) !== null && _a !== void 0 ? _a : '';
        // Check the "backTo" parameter to decide navigation behavior
        if (!backTo) {
            Navigation_1.default.goBack();
        }
        else {
            // Set compareParams to false because we want to goUp to this particular screen and update params (state).
            Navigation_1.default.goBack((0, Url_1.appendParam)(backTo, 'state', option.value), { compareParams: false });
        }
    }, [params === null || params === void 0 ? void 0 : params.backTo]);
    return (<ScreenWrapper_1.default testID={StateSelectionPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default 
    // Label can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    title={label || translate('common.state')} shouldShowBackButton onBackButtonPress={function () {
            var _a;
            var backTo = (_a = params === null || params === void 0 ? void 0 : params.backTo) !== null && _a !== void 0 ? _a : '';
            var backToRoute;
            if (backTo) {
                backToRoute = (0, Url_1.appendParam)(backTo, 'state', currentState !== null && currentState !== void 0 ? currentState : '');
            }
            Navigation_1.default.goBack(backToRoute);
        }}/>
            {/* This empty, non-harmful view fixes the issue with SelectionList scrolling and shouldUseDynamicMaxToRenderPerBatch. It can be removed without consequences if a solution for SelectionList is found. See comment https://github.com/Expensify/App/pull/36770#issuecomment-2017028096 */}
            <react_native_1.View />

            <SelectionList_1.default onSelectRow={selectCountryState} shouldSingleExecuteRowSelect headerMessage={headerMessage} 
    // Label can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    textInputLabel={label || translate('common.state')} textInputValue={searchValue} sections={[{ data: searchResults }]} onChangeText={setSearchValue} initiallyFocusedOptionKey={currentState} shouldUseDynamicMaxToRenderPerBatch ListItem={RadioListItem_1.default} addBottomSafeAreaPadding/>
        </ScreenWrapper_1.default>);
}
StateSelectionPage.displayName = 'StateSelectionPage';
exports.default = StateSelectionPage;
