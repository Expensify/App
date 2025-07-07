"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function OpenWorkspacePlanPage(policyID) {
    if (!policyID) {
        Log_1.default.warn('OpenWorkspacePlanPage invalid params', { policyID: policyID });
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
            },
        },
    ];
    var params = {
        policyID: policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_WORKSPACE_PLAN_PAGE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
exports.default = OpenWorkspacePlanPage;
