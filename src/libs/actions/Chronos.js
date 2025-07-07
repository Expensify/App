"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEvent = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var removeEvent = function (reportID, reportActionID, eventID, events) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[reportActionID] = {
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    originalMessage: {
                        events: events.filter(function (event) { return event.id !== eventID; }),
                    },
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[reportActionID] = {
                    originalMessage: { events: events },
                    pendingAction: null,
                },
                _c),
        },
    ];
    var parameters = {
        googleEventID: eventID,
        reportActionID: reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.CHRONOS_REMOVE_OOO_EVENT, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
};
exports.removeEvent = removeEvent;
