"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var IntlPolyfill_1 = require("@libs/IntlPolyfill");
var Device_1 = require("@userActions/Device");
var Locale_1 = require("@userActions/Locale");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var addUtilsToWindow_1 = require("./addUtilsToWindow");
var platformSetup_1 = require("./platformSetup");
var telemetry_1 = require("./telemetry");
function default_1() {
    var _a;
    (0, telemetry_1.default)();
    /*
     * Initialize the Onyx store when the app loads for the first time.
     *
     * Note: This Onyx initialization has been very intentionally placed completely outside of the React lifecycle of the main App component.
     *
     * To understand why we must do this, you must first understand that a typical React Native Android application consists of an Application and an Activity.
     * The project root's index.js runs in the Application, but the main RN `App` component + UI runs in a separate Activity, spawned when you call AppRegistry.registerComponent.
     * When an application launches in a headless JS context (i.e: when woken from a killed state by a push notification), only the Application is available, but not the UI Activity.
     * This means that in a headless context NO REACT CODE IS EXECUTED, and none of your components will mount.
     *
     * However, we still need to use Onyx to update the underlying app data from the headless JS context.
     * Therefore it must be initialized completely outside the React component lifecycle.
     */
    react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        // Increase the cached key count so that the app works more consistently for accounts with large numbers of reports
        maxCachedKeysCount: 50000,
        evictableKeys: [
            ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
            ONYXKEYS_1.default.COLLECTION.SNAPSHOT,
            ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS,
            ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_PAGES,
            ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS,
        ],
        initialKeyStates: (_a = {},
            // Clear any loading and error messages so they do not appear on app startup
            _a[ONYXKEYS_1.default.SESSION] = { loading: false },
            _a[ONYXKEYS_1.default.ACCOUNT] = CONST_1.default.DEFAULT_ACCOUNT_DATA,
            _a[ONYXKEYS_1.default.NETWORK] = CONST_1.default.DEFAULT_NETWORK_DATA,
            _a[ONYXKEYS_1.default.IS_SIDEBAR_LOADED] = false,
            _a[ONYXKEYS_1.default.SHOULD_SHOW_COMPOSE_INPUT] = true,
            _a[ONYXKEYS_1.default.MODAL] = {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            _a),
        skippableCollectionMemberIDs: CONST_1.default.SKIPPABLE_COLLECTION_MEMBER_IDS,
    });
    // Init locale early to avoid rendering translations keys instead of real translations
    (0, Locale_1.default)();
    (0, OnyxDerived_1.default)();
    (0, Device_1.setDeviceID)();
    // Force app layout to work left to right because our design does not currently support devices using this mode
    react_native_1.I18nManager.allowRTL(false);
    react_native_1.I18nManager.forceRTL(false);
    // Polyfill the Intl API if locale data is not as expected
    (0, IntlPolyfill_1.default)();
    // Perform any other platform-specific setup
    (0, platformSetup_1.default)();
    (0, addUtilsToWindow_1.default)();
}
