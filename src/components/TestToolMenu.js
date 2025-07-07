"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useIsAuthenticated_1 = require("@hooks/useIsAuthenticated");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ApiUtils_1 = require("@libs/ApiUtils");
var Network_1 = require("@userActions/Network");
var Session_1 = require("@userActions/Session");
var User_1 = require("@userActions/User");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Button_1 = require("./Button");
var Switch_1 = require("./Switch");
var TestCrash_1 = require("./TestCrash");
var TestToolRow_1 = require("./TestToolRow");
var Text_1 = require("./Text");
var ACCOUNT_DEFAULT = {
    shouldUseStagingServer: undefined,
    isSubscribedToNewsletter: false,
    validated: false,
    isFromPublicDomain: false,
    isUsingExpensifyCard: false,
    isDebugModeEnabled: false,
};
function TestToolMenu() {
    var _a;
    var network = (0, useOnyx_1.default)(ONYXKEYS_1.default.NETWORK, { canBeMissing: true })[0];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0], account = _b === void 0 ? ACCOUNT_DEFAULT : _b;
    var isUsingImportedState = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_USING_IMPORTED_STATE, { canBeMissing: true })[0];
    var shouldUseStagingServer = (_a = account === null || account === void 0 ? void 0 : account.shouldUseStagingServer) !== null && _a !== void 0 ? _a : (0, ApiUtils_1.isUsingStagingApi)();
    var isDebugModeEnabled = !!(account === null || account === void 0 ? void 0 : account.isDebugModeEnabled);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // Check if the user is authenticated to show options that require authentication
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    return (<>
            <Text_1.default style={[styles.textLabelSupporting, styles.mb4]} numberOfLines={1}>
                {translate('initialSettingsPage.troubleshoot.testingPreferences')}
            </Text_1.default>
            {isAuthenticated && (<>
                    {/* When toggled the app will be put into debug mode. */}
                    <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.debugMode')}>
                        <Switch_1.default accessibilityLabel={translate('initialSettingsPage.troubleshoot.debugMode')} isOn={isDebugModeEnabled} onToggle={function () { return (0, User_1.setIsDebugModeEnabled)(!isDebugModeEnabled); }}/>
                    </TestToolRow_1.default>

                    {/* Instantly invalidates a user's local authToken. Useful for testing flows related to reauthentication. */}
                    <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button_1.default small text={translate('initialSettingsPage.troubleshoot.invalidate')} onPress={function () { return (0, Session_1.invalidateAuthToken)(); }}/>
                    </TestToolRow_1.default>

                    {/* Invalidate stored user auto-generated credentials. Useful for manually testing sign out logic. */}
                    <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.deviceCredentials')}>
                        <Button_1.default small text={translate('initialSettingsPage.troubleshoot.destroy')} onPress={function () { return (0, Session_1.invalidateCredentials)(); }}/>
                    </TestToolRow_1.default>

                    {/* Sends an expired session to the FE and invalidates the session by the same time in the BE. Action is delayed for 15s */}
                    <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.authenticationStatus')}>
                        <Button_1.default small text={translate('initialSettingsPage.troubleshoot.invalidateWithDelay')} onPress={function () { return (0, Session_1.expireSessionWithDelay)(); }}/>
                    </TestToolRow_1.default>
                </>)}

            {/* Option to switch between staging and default api endpoints.
    This enables QA, internal testers and external devs to take advantage of sandbox environments for 3rd party services like Plaid and Onfido.
    This toggle is not rendered for internal devs as they make environment changes directly to the .env file. */}
            {!CONFIG_1.default.IS_USING_LOCAL_WEB && (<TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.useStagingServer')}>
                    <Switch_1.default accessibilityLabel="Use Staging Server" isOn={shouldUseStagingServer} onToggle={function () { return (0, User_1.setShouldUseStagingServer)(!shouldUseStagingServer); }}/>
                </TestToolRow_1.default>)}

            {/* When toggled the app will be forced offline. */}
            <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.forceOffline')}>
                <Switch_1.default accessibilityLabel="Force offline" isOn={!!(network === null || network === void 0 ? void 0 : network.shouldForceOffline)} onToggle={function () { return (0, Network_1.setShouldForceOffline)(!(network === null || network === void 0 ? void 0 : network.shouldForceOffline)); }} disabled={!!isUsingImportedState || !!(network === null || network === void 0 ? void 0 : network.shouldSimulatePoorConnection) || (network === null || network === void 0 ? void 0 : network.shouldFailAllRequests)}/>
            </TestToolRow_1.default>

            {/* When toggled the app will randomly change internet connection every 2-5 seconds */}
            <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.simulatePoorConnection')}>
                <Switch_1.default accessibilityLabel="Simulate poor internet connection" isOn={!!(network === null || network === void 0 ? void 0 : network.shouldSimulatePoorConnection)} onToggle={function () { return (0, Network_1.setShouldSimulatePoorConnection)(!(network === null || network === void 0 ? void 0 : network.shouldSimulatePoorConnection), network === null || network === void 0 ? void 0 : network.poorConnectionTimeoutID); }} disabled={!!isUsingImportedState || !!(network === null || network === void 0 ? void 0 : network.shouldFailAllRequests) || (network === null || network === void 0 ? void 0 : network.shouldForceOffline)}/>
            </TestToolRow_1.default>

            {/* When toggled all network requests will fail. */}
            <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.simulateFailingNetworkRequests')}>
                <Switch_1.default accessibilityLabel="Simulate failing network requests" isOn={!!(network === null || network === void 0 ? void 0 : network.shouldFailAllRequests)} onToggle={function () { return (0, Network_1.setShouldFailAllRequests)(!(network === null || network === void 0 ? void 0 : network.shouldFailAllRequests)); }} disabled={!!(network === null || network === void 0 ? void 0 : network.shouldForceOffline) || (network === null || network === void 0 ? void 0 : network.shouldSimulatePoorConnection)}/>
            </TestToolRow_1.default>
            <TestCrash_1.default />
        </>);
}
TestToolMenu.displayName = 'TestToolMenu';
exports.default = TestToolMenu;
