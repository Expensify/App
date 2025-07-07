"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function PronounsPage(_a) {
    var _b;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP)[0], isLoadingApp = _c === void 0 ? true : _c;
    var currentPronouns = (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.pronouns) !== null && _b !== void 0 ? _b : '';
    var currentPronounsKey = currentPronouns.substring(CONST_1.default.PRONOUNS.PREFIX.length);
    var _d = (0, react_1.useState)(''), searchValue = _d[0], setSearchValue = _d[1];
    var isOptionSelected = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (isLoadingApp && !currentUserPersonalDetails.pronouns) {
            return;
        }
        var currentPronounsText = CONST_1.default.PRONOUNS_LIST.find(function (value) { return value === currentPronounsKey; });
        setSearchValue(currentPronounsText ? translate("pronouns.".concat(currentPronounsText)) : '');
        // Only need to update search value when the first time the data is loaded
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingApp]);
    var filteredPronounsList = (0, react_1.useMemo)(function () {
        var pronouns = CONST_1.default.PRONOUNS_LIST.map(function (value) {
            var fullPronounKey = "".concat(CONST_1.default.PRONOUNS.PREFIX).concat(value);
            var isCurrentPronouns = fullPronounKey === currentPronouns;
            return {
                text: translate("pronouns.".concat(value)),
                value: fullPronounKey,
                keyForList: value,
                isSelected: isCurrentPronouns,
            };
        }).sort(function (a, b) { return a.text.toLowerCase().localeCompare(b.text.toLowerCase()); });
        var trimmedSearch = searchValue.trim();
        if (trimmedSearch.length === 0) {
            return [];
        }
        return pronouns.filter(function (pronoun) { return pronoun.text.toLowerCase().indexOf(trimmedSearch.toLowerCase()) >= 0; });
    }, [searchValue, currentPronouns, translate]);
    var headerMessage = searchValue.trim() && (filteredPronounsList === null || filteredPronounsList === void 0 ? void 0 : filteredPronounsList.length) === 0 ? translate('common.noResultsFound') : '';
    var updatePronouns = function (selectedPronouns) {
        var _a;
        if (isOptionSelected.current) {
            return;
        }
        isOptionSelected.current = true;
        (0, PersonalDetails_1.updatePronouns)(selectedPronouns.keyForList === currentPronounsKey ? '' : ((_a = selectedPronouns === null || selectedPronouns === void 0 ? void 0 : selectedPronouns.value) !== null && _a !== void 0 ? _a : ''));
        Navigation_1.default.goBack();
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={PronounsPage.displayName}>
            {isLoadingApp && !currentUserPersonalDetails.pronouns ? (<FullscreenLoadingIndicator_1.default />) : (<>
                    <HeaderWithBackButton_1.default title={translate('pronounsPage.pronouns')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                    <Text_1.default style={[styles.ph5, styles.mb3]}>{translate('pronounsPage.isShownOnProfile')}</Text_1.default>
                    <SelectionList_1.default headerMessage={headerMessage} textInputLabel={translate('pronounsPage.pronouns')} textInputPlaceholder={translate('pronounsPage.placeholderText')} textInputValue={searchValue} sections={[{ data: filteredPronounsList }]} ListItem={RadioListItem_1.default} onSelectRow={updatePronouns} shouldSingleExecuteRowSelect onChangeText={setSearchValue} initiallyFocusedOptionKey={currentPronounsKey}/>
                </>)}
        </ScreenWrapper_1.default>);
}
PronounsPage.displayName = 'PronounsPage';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(PronounsPage);
