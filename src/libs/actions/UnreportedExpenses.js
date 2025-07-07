"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUnreportedExpenses = fetchUnreportedExpenses;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function fetchUnreportedExpenses(offset) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: true,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: false,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.IS_LOADING_UNREPORTED_TRANSACTIONS,
            value: false,
        },
    ];
    API.read(types_1.READ_COMMANDS.OPEN_UNREPORTED_EXPENSES_PAGE, { offset: offset }, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
