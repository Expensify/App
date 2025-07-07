"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetails = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function TimezoneInitialPage(_a) {
    var _b;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var timezone = (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.timezone) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_TIME_ZONE;
    var translate = (0, useLocalize_1.default)().translate;
    var currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    /**
     * Updates setting for automatic timezone selection.
     * Note: If we are updating automatically, we'll immediately calculate the user's timezone.
     */
    var updateAutomaticTimezone = function (isAutomatic) {
        PersonalDetails.updateAutomaticTimezone({
            automatic: isAutomatic,
            selected: isAutomatic && !(0, EmptyObject_1.isEmptyObject)(currentTimezone) ? currentTimezone : timezone.selected,
        });
    };
    return (<ScreenWrapper_1.default testID={TimezoneInitialPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('timezonePage.timezone')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <react_native_1.View style={styles.flex1}>
                <react_native_1.View style={[styles.ph5]}>
                    <Text_1.default style={[styles.mb5]}>{translate('timezonePage.isShownOnProfile')}</Text_1.default>
                    <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text_1.default style={[styles.flexShrink1, styles.mr2]}>{translate('timezonePage.getLocationAutomatically')}</Text_1.default>
                        <Switch_1.default accessibilityLabel={translate('timezonePage.getLocationAutomatically')} isOn={!!timezone.automatic} onToggle={updateAutomaticTimezone}/>
                    </react_native_1.View>
                </react_native_1.View>
                <MenuItemWithTopDescription_1.default title={timezone.selected} description={translate('timezonePage.timezone')} shouldShowRightIcon disabled={timezone.automatic} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_TIMEZONE_SELECT); }}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
TimezoneInitialPage.displayName = 'TimezoneInitialPage';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(TimezoneInitialPage);
