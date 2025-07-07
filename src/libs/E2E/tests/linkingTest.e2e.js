"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var react_native_config_1 = require("react-native-config");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var client_1 = require("@libs/E2E/client");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var getPromiseWithResolve_1 = require("@libs/E2E/utils/getPromiseWithResolve");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var test = function (config) {
    console.debug('[E2E] Logging in for comment linking');
    var reportID = (0, getConfigValueOrThrow_1.default)('reportID', config);
    var linkedReportID = (0, getConfigValueOrThrow_1.default)('linkedReportID', config);
    var linkedReportActionID = (0, getConfigValueOrThrow_1.default)('linkedReportActionID', config);
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    var startTestTime = Date.now();
    console.debug('[E2E] Test started at:', startTestTime);
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () { return client_1.default.submitTestDone(); });
        }
        var _a = (0, getPromiseWithResolve_1.default)(), appearMessagePromise = _a[0], appearMessageResolve = _a[1];
        var _b = (0, getPromiseWithResolve_1.default)(), openReportPromise = _b[0], openReportResolve = _b[1];
        var lastVisibleMessageId;
        var verificationStarted = false;
        var hasNavigatedToLinkedMessage = false;
        var subscription = react_native_1.DeviceEventEmitter.addListener('onViewableItemsChanged', function (res) {
            var _a, _b;
            console.debug('[E2E] Viewable items event triggered at:', Date.now());
            // update the last visible message
            lastVisibleMessageId = (_b = (_a = res === null || res === void 0 ? void 0 : res.at(0)) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.reportActionID;
            console.debug('[E2E] Current visible message:', lastVisibleMessageId);
            if (!verificationStarted && lastVisibleMessageId === linkedReportActionID) {
                console.debug('[E2E] Target message found, starting verification');
                verificationStarted = true;
                setTimeout(function () {
                    console.debug('[E2E] Verification timeout completed');
                    console.debug('[E2E] Last visible message ID:', lastVisibleMessageId);
                    console.debug('[E2E] Expected message ID:', linkedReportActionID);
                    subscription.remove();
                    if (lastVisibleMessageId === linkedReportActionID) {
                        console.debug('[E2E] Message position verified successfully');
                        appearMessageResolve();
                    }
                    else {
                        console.debug('[E2E] Linked message not found, failing test!');
                        client_1.default.submitTestResults({
                            branch: react_native_config_1.default.E2E_BRANCH,
                            error: 'Linked message not found',
                            name: "".concat(name, " test can't find linked message"),
                        }).then(function () { return client_1.default.submitTestDone(); });
                    }
                }, 3000);
            }
        });
        Promise.all([appearMessagePromise, openReportPromise])
            .then(function () {
            console.debug('[E2E] Test completed successfully at:', Date.now());
            console.debug('[E2E] Total test duration:', Date.now() - startTestTime, 'ms');
            client_1.default.submitTestDone();
        })
            .catch(function (err) {
            console.debug('[E2E] Error while submitting test results:', err);
        });
        Performance_1.default.subscribeToMeasurements(function (entry) {
            console.debug("[E2E] Performance entry captured: ".concat(entry.name, " at ").concat(entry.startTime, ", duration: ").concat(entry.duration, " ms"));
            if (entry.name === CONST_1.default.TIMING.SIDEBAR_LOADED) {
                console.debug('[E2E] Sidebar loaded, navigating to a report at:', Date.now());
                var startNavigateTime = Date.now();
                Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT);
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
                console.debug('[E2E] Navigation to report took:', Date.now() - startNavigateTime, 'ms');
                return;
            }
            if (entry.name === CONST_1.default.TIMING.OPEN_REPORT && !hasNavigatedToLinkedMessage) {
                console.debug('[E2E] Navigating to the linked report action at:', Date.now());
                var startLinkedNavigateTime = Date.now();
                hasNavigatedToLinkedMessage = true; // Set flag to prevent duplicate navigation
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(linkedReportID, linkedReportActionID));
                console.debug('[E2E] Navigation to linked report took:', Date.now() - startLinkedNavigateTime, 'ms');
                client_1.default.submitTestResults({
                    branch: react_native_config_1.default.E2E_BRANCH,
                    name: name,
                    metric: entry.duration,
                    unit: 'ms',
                });
                openReportResolve();
            }
        });
    });
};
exports.default = test;
