"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var ScrollView_1 = require("@components/ScrollView");
var SwipeInterceptPanResponder_1 = require("@components/SwipeInterceptPanResponder");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThrottledButtonState_1 = require("@hooks/useThrottledButtonState");
var Clipboard_1 = require("@libs/Clipboard");
var DebugUtils_1 = require("@libs/DebugUtils");
function DebugJSON(_a) {
    var data = _a.data;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useThrottledButtonState_1.default)(), isThrottledButtonActive = _b[0], setThrottledButtonInactive = _b[1];
    var json = (0, react_1.useMemo)(function () { return DebugUtils_1.default.stringifyJSON(data); }, [data]);
    return (<ScrollView_1.default style={styles.mt5} contentContainerStyle={[styles.gap5, styles.ph5]}>
            <Button_1.default isDisabled={!isThrottledButtonActive} text={isThrottledButtonActive ? translate('reportActionContextMenu.copyOnyxData') : translate('reportActionContextMenu.copied')} onPress={function () {
            Clipboard_1.default.setString(json);
            setThrottledButtonInactive();
        }} icon={Expensicons.Copy}/>
            <react_native_1.View 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...SwipeInterceptPanResponder_1.default.panHandlers}>
                <Text_1.default style={[styles.textLabel, styles.mb5, styles.border, styles.p2]}>{json}</Text_1.default>
            </react_native_1.View>
        </ScrollView_1.default>);
}
DebugJSON.displayName = 'DebugJSON';
exports.default = DebugJSON;
