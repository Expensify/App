"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useIsAuthenticated_1 = require("@hooks/useIsAuthenticated");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Navigation_1 = require("@navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var Button_1 = require("./Button");
var RecordTroubleshootDataToolMenu_1 = require("./RecordTroubleshootDataToolMenu");
var SafeAreaConsumer_1 = require("./SafeAreaConsumer");
var ScrollView_1 = require("./ScrollView");
var TestToolMenu_1 = require("./TestToolMenu");
var TestToolRow_1 = require("./TestToolRow");
var Text_1 = require("./Text");
function getRouteBasedOnAuthStatus(isAuthenticated, activeRoute) {
    return isAuthenticated ? ROUTES_1.default.SETTINGS_CONSOLE.getRoute(activeRoute) : ROUTES_1.default.PUBLIC_CONSOLE_DEBUG.getRoute(activeRoute);
}
function TestToolsModalPage() {
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var activeRoute = Navigation_1.default.getActiveRoute();
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_STORE_LOGS, { canBeMissing: true })[0], shouldStoreLogs = _a === void 0 ? false : _a;
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    var route = getRouteBasedOnAuthStatus(isAuthenticated, activeRoute);
    var maxHeight = windowHeight;
    return (<SafeAreaConsumer_1.default>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[{ maxHeight: maxHeight }, styles.h100, styles.defaultModalContainer, safeAreaPaddingBottomStyle]}>
                    <ScrollView_1.default style={[styles.flex1, styles.flexGrow1, styles.ph5]}>
                        <Text_1.default style={[styles.textLabelSupporting, styles.mt5, styles.mb3]} numberOfLines={1}>
                            {translate('initialSettingsPage.troubleshoot.releaseOptions')}
                        </Text_1.default>
                        <RecordTroubleshootDataToolMenu_1.default />
                        {!!shouldStoreLogs && (<TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.debugConsole')}>
                                <Button_1.default small text={translate('initialSettingsPage.debugConsole.viewConsole')} onPress={function () {
                        Navigation_1.default.navigate(route);
                    }}/>
                            </TestToolRow_1.default>)}
                        <TestToolMenu_1.default />
                    </ScrollView_1.default>
                </react_native_1.View>);
        }}
        </SafeAreaConsumer_1.default>);
}
TestToolsModalPage.displayName = 'TestToolsModalPage';
exports.default = TestToolsModalPage;
