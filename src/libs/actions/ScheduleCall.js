"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideCallAvailabilitySchedule = getGuideCallAvailabilitySchedule;
exports.saveBookingDraft = saveBookingDraft;
exports.clearBookingDraft = clearBookingDraft;
exports.confirmBooking = confirmBooking;
exports.rescheduleBooking = rescheduleBooking;
exports.cancelBooking = cancelBooking;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Link_1 = require("./Link");
function getGuideCallAvailabilitySchedule(reportID) {
    if (!reportID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID),
            value: {
                calendlySchedule: {
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID),
            value: {
                calendlySchedule: {
                    isLoading: false,
                    errors: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID),
            value: {
                calendlySchedule: {
                    isLoading: false,
                },
            },
        },
    ];
    var params = {
        reportID: reportID,
    };
    API.read(types_1.READ_COMMANDS.GET_GUIDE_CALL_AVAILABILITY_SCHEDULE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function saveBookingDraft(data) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.SCHEDULE_CALL_DRAFT), data);
}
function clearBookingDraft() {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.SCHEDULE_CALL_DRAFT), null);
}
function confirmBooking(data, currentUser, timezone) {
    var _a, _b;
    var scheduleURL = "".concat(data.guide.scheduleURL, "?name=").concat(encodeURIComponent((_a = currentUser.displayName) !== null && _a !== void 0 ? _a : ''), "&email=").concat(encodeURIComponent((_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.login) !== null && _b !== void 0 ? _b : ''), "&utm_source=newDot&utm_medium=report&utm_content=").concat(data.reportID, "&timezone=").concat(timezone);
    (0, Link_1.openExternalLink)(scheduleURL);
    clearBookingDraft();
    Navigation_1.default.dismissModal();
}
function getEventIDFromURI(eventURI) {
    var parts = eventURI.split('/');
    // Last path in the URI is ID
    return parts.slice(-1).at(0);
}
function rescheduleBooking(call) {
    var rescheduleURL = "https://calendly.com/reschedulings/".concat(getEventIDFromURI(call.eventURI));
    (0, Link_1.openExternalLink)(rescheduleURL);
}
function cancelBooking(call) {
    var cancelURL = "https://calendly.com/cancellations/".concat(getEventIDFromURI(call.eventURI));
    (0, Link_1.openExternalLink)(cancelURL);
}
