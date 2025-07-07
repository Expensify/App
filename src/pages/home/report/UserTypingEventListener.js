"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Report = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function UserTypingEventListener(_a) {
    var report = _a.report;
    var lastVisitedPath = (0, useOnyx_1.default)(ONYXKEYS_1.default.LAST_VISITED_PATH, { selector: function (path) { return path !== null && path !== void 0 ? path : ''; } })[0];
    var didSubscribeToReportTypingEvents = (0, react_1.useRef)(false);
    var reportID = report.reportID;
    var isFocused = (0, native_1.useIsFocused)();
    var route = (0, native_1.useRoute)();
    (0, react_1.useEffect)(function () { return function () {
        if (!didSubscribeToReportTypingEvents.current) {
            return;
        }
        // unsubscribe from report typing events when the component unmounts
        didSubscribeToReportTypingEvents.current = false;
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Report.unsubscribeFromReportChannel(reportID);
        });
    }; }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    (0, react_1.useEffect)(function () {
        var _a;
        // Ensures any optimistic report that is being created (ex: a thread report) gets created and initialized successfully before subscribing
        if (((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.reportID) !== reportID) {
            return;
        }
        var interactionTask = null;
        if (isFocused) {
            // Ensures subscription event succeeds when the report/workspace room is created optimistically.
            // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
            // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
            // Existing reports created will have empty fields for `pendingFields`.
            var didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
            if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
                interactionTask = react_native_1.InteractionManager.runAfterInteractions(function () {
                    Report.subscribeToReportTypingEvents(reportID);
                    didSubscribeToReportTypingEvents.current = true;
                });
            }
        }
        else {
            var topmostReportId = Navigation_1.default.getTopmostReportId();
            if (topmostReportId !== reportID && didSubscribeToReportTypingEvents.current) {
                didSubscribeToReportTypingEvents.current = false;
                react_native_1.InteractionManager.runAfterInteractions(function () {
                    Report.unsubscribeFromReportChannel(reportID);
                });
            }
        }
        return function () {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [isFocused, report.pendingFields, didSubscribeToReportTypingEvents, lastVisitedPath, reportID, route]);
    return null;
}
UserTypingEventListener.displayName = 'UserTypingEventListener';
exports.default = UserTypingEventListener;
