"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var createUpdate = function (lastUpdateID, successData, previousUpdateID) {
    if (successData === void 0) { successData = []; }
    return ({
        type: CONST_1.default.ONYX_UPDATE_TYPES.HTTPS,
        lastUpdateID: lastUpdateID,
        previousUpdateID: previousUpdateID !== null && previousUpdateID !== void 0 ? previousUpdateID : lastUpdateID - 1,
        request: {
            command: 'TestCommand',
            data: { apiRequestType: 'TestType' },
            successData: successData,
            failureData: [],
            finallyData: [],
            optimisticData: [],
        },
        response: {
            jsonCode: 200,
            lastUpdateID: lastUpdateID,
            previousUpdateID: previousUpdateID !== null && previousUpdateID !== void 0 ? previousUpdateID : lastUpdateID - 1,
            onyxData: successData,
        },
    });
};
var createPendingUpdate = function (lastUpdateID) { return ({
    type: CONST_1.default.ONYX_UPDATE_TYPES.AIRSHIP,
    lastUpdateID: lastUpdateID,
    shouldFetchPendingUpdates: true,
    updates: [],
}); };
var OnyxUpdateMockUtils = {
    createUpdate: createUpdate,
    createPendingUpdate: createPendingUpdate,
};
exports.default = OnyxUpdateMockUtils;
