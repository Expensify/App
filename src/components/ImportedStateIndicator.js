"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var App_1 = require("@libs/actions/App");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Button_1 = require("./Button");
function ImportedStateIndicator() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isUsingImportedState = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_USING_IMPORTED_STATE)[0];
    if (!isUsingImportedState) {
        return null;
    }
    return (<react_native_1.View style={[styles.buttonDanger]}>
            <Button_1.default danger small shouldRemoveLeftBorderRadius shouldRemoveRightBorderRadius text={translate('initialSettingsPage.troubleshoot.usingImportedState')} onPress={function () { return (0, App_1.clearOnyxAndResetApp)(true); }} textStyles={[styles.fontWeightNormal]}/>
        </react_native_1.View>);
}
exports.default = ImportedStateIndicator;
