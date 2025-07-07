"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPolicyAccountingPage = openPolicyAccountingPage;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function openPolicyAccountingPage(policyID) {
    var hasConnectionsDataBeenFetchedKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED).concat(policyID);
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: true,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: hasConnectionsDataBeenFetchedKey,
            value: false,
        },
    ];
    var parameters = {
        policyID: policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE, parameters, {
        successData: successData,
        failureData: failureData,
    });
}
