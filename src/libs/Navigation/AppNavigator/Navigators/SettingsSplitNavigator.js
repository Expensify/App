"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CENTRAL_PANE_SETTINGS_SCREENS = void 0;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FocusTrapForScreen_1 = require("@components/FocusTrap/FocusTrapForScreen");
var createSplitNavigator_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator");
var useSplitNavigatorScreenOptions_1 = require("@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions");
var SCREENS_1 = require("@src/SCREENS");
var loadInitialSettingsPage = function () { return require('../../../../pages/settings/InitialSettingsPage').default; };
var CENTRAL_PANE_SETTINGS_SCREENS = (_a = {},
    _a[SCREENS_1.default.SETTINGS.PREFERENCES.ROOT] = function () { return require('../../../../pages/settings/Preferences/PreferencesPage').default; },
    _a[SCREENS_1.default.SETTINGS.SECURITY] = function () { return require('../../../../pages/settings/Security/SecuritySettingsPage').default; },
    _a[SCREENS_1.default.SETTINGS.PROFILE.ROOT] = function () { return require('../../../../pages/settings/Profile/ProfilePage').default; },
    _a[SCREENS_1.default.SETTINGS.WALLET.ROOT] = function () { return require('../../../../pages/settings/Wallet/WalletPage').default; },
    _a[SCREENS_1.default.SETTINGS.ABOUT] = function () { return require('../../../../pages/settings/AboutPage/AboutPage').default; },
    _a[SCREENS_1.default.SETTINGS.TROUBLESHOOT] = function () { return require('../../../../pages/settings/Troubleshoot/TroubleshootPage').default; },
    _a[SCREENS_1.default.SETTINGS.SAVE_THE_WORLD] = function () { return require('../../../../pages/TeachersUnite/SaveTheWorldPage').default; },
    _a[SCREENS_1.default.SETTINGS.SUBSCRIPTION.ROOT] = function () { return require('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default; },
    _a);
exports.CENTRAL_PANE_SETTINGS_SCREENS = CENTRAL_PANE_SETTINGS_SCREENS;
var Split = (0, createSplitNavigator_1.default)();
function SettingsSplitNavigator() {
    var route = (0, native_1.useRoute)();
    var splitNavigatorScreenOptions = (0, useSplitNavigatorScreenOptions_1.default)();
    return (<FocusTrapForScreen_1.default>
            <react_native_1.View style={{ flex: 1 }}>
                <Split.Navigator persistentScreens={[SCREENS_1.default.SETTINGS.ROOT]} sidebarScreen={SCREENS_1.default.SETTINGS.ROOT} defaultCentralScreen={SCREENS_1.default.SETTINGS.PROFILE.ROOT} parentRoute={route} screenOptions={splitNavigatorScreenOptions.centralScreen}>
                    <Split.Screen name={SCREENS_1.default.SETTINGS.ROOT} getComponent={loadInitialSettingsPage} options={splitNavigatorScreenOptions.sidebarScreen}/>
                    {Object.entries(CENTRAL_PANE_SETTINGS_SCREENS).map(function (_a) {
            var screenName = _a[0], componentGetter = _a[1];
            return (<Split.Screen key={screenName} name={screenName} getComponent={componentGetter}/>);
        })}
                </Split.Navigator>
            </react_native_1.View>
        </FocusTrapForScreen_1.default>);
}
SettingsSplitNavigator.displayName = 'SettingsSplitNavigator';
exports.default = SettingsSplitNavigator;
