"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var TestToolRow_1 = require("@components/TestToolRow");
var useLocalize_1 = require("@hooks/useLocalize");
var testCrash_1 = require("@libs/testCrash");
var firebase_json_1 = require("../../../firebase.json");
/**
 * Adds a button in native dev builds to test the crashlytics integration with user info.
 */
function TestCrash() {
    var _a, _b;
    var translate = (0, useLocalize_1.default)().translate;
    var isCrashlyticsDebugEnabled = (_b = (_a = firebase_json_1.default === null || firebase_json_1.default === void 0 ? void 0 : firebase_json_1.default['react-native']) === null || _a === void 0 ? void 0 : _a.crashlytics_debug_enabled) !== null && _b !== void 0 ? _b : false;
    var toolRowTitle = translate('initialSettingsPage.troubleshoot.testCrash');
    return (<react_native_1.View>
            {isCrashlyticsDebugEnabled || !__DEV__ ? (<TestToolRow_1.default title={toolRowTitle}>
                    <Button_1.default small text={toolRowTitle} onPress={testCrash_1.default}/>
                </TestToolRow_1.default>) : null}
        </react_native_1.View>);
}
exports.default = TestCrash;
