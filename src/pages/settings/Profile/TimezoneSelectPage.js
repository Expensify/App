"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useInitialValue_1 = require("@hooks/useInitialValue");
var useLocalize_1 = require("@hooks/useLocalize");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetails = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var TIMEZONES_1 = require("@src/TIMEZONES");
/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 */
var getKey = function (text) { return "".concat(text, "-").concat(new Date().getTime()); };
var getUserTimezone = function (currentUserPersonalDetails) { var _a; return (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_TIME_ZONE; };
function TimezoneSelectPage(_a) {
    var _b;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var translate = (0, useLocalize_1.default)().translate;
    var timezone = getUserTimezone(currentUserPersonalDetails);
    var allTimezones = (0, useInitialValue_1.default)(function () {
        return TIMEZONES_1.default.filter(function (tz) { return !tz.startsWith('Etc/GMT'); }).map(function (text) { return ({
            text: text,
            keyForList: getKey(text),
            isSelected: text === timezone.selected,
        }); });
    });
    var _c = (0, react_1.useState)(''), timezoneInputText = _c[0], setTimezoneInputText = _c[1];
    var _d = (0, react_1.useState)(allTimezones), timezoneOptions = _d[0], setTimezoneOptions = _d[1];
    var saveSelectedTimezone = function (_a) {
        var text = _a.text;
        PersonalDetails.updateSelectedTimezone(text);
    };
    var filterShownTimezones = function (searchText) {
        var _a;
        setTimezoneInputText(searchText);
        var searchWords = (_a = searchText.toLowerCase().match(/[a-z0-9]+/g)) !== null && _a !== void 0 ? _a : [];
        setTimezoneOptions(allTimezones.filter(function (tz) {
            return searchWords.every(function (word) {
                return tz.text
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, ' ')
                    .includes(word);
            });
        }));
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={TimezoneSelectPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('timezonePage.timezone')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_TIMEZONE); }}/>
            <SelectionList_1.default headerMessage={timezoneInputText.trim() && !timezoneOptions.length ? translate('common.noResultsFound') : ''} textInputLabel={translate('timezonePage.timezone')} textInputValue={timezoneInputText} onChangeText={filterShownTimezones} onSelectRow={saveSelectedTimezone} shouldSingleExecuteRowSelect sections={[{ data: timezoneOptions, isDisabled: timezone.automatic }]} initiallyFocusedOptionKey={(_b = timezoneOptions.find(function (tz) { return tz.text === timezone.selected; })) === null || _b === void 0 ? void 0 : _b.keyForList} showScrollIndicator shouldShowTooltips={false} ListItem={RadioListItem_1.default} shouldPreventActiveCellVirtualization/>
        </ScreenWrapper_1.default>);
}
TimezoneSelectPage.displayName = 'TimezoneSelectPage';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(TimezoneSelectPage);
