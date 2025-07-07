"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUpdateInformation = exports.doesClientNeedToBeUpdated = exports.apply = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
jest.mock('@libs/actions/OnyxUpdateManager/utils/applyUpdates');
var OnyxUpdatesImplementation = jest.requireActual('@libs/actions/OnyxUpdates');
var doesClientNeedToBeUpdated = OnyxUpdatesImplementation.doesClientNeedToBeUpdated, saveUpdateInformation = OnyxUpdatesImplementation.saveUpdateInformation, applyHTTPSOnyxUpdates = OnyxUpdatesImplementation.INTERNAL_DO_NOT_USE_applyHTTPSOnyxUpdates;
exports.doesClientNeedToBeUpdated = doesClientNeedToBeUpdated;
exports.saveUpdateInformation = saveUpdateInformation;
var lastUpdateIDAppliedToClient = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: function (val) { return (lastUpdateIDAppliedToClient = val); },
});
var apply = jest.fn(function (_a) {
    var lastUpdateID = _a.lastUpdateID, request = _a.request, response = _a.response;
    if (lastUpdateID && (lastUpdateIDAppliedToClient === undefined || Number(lastUpdateID) > lastUpdateIDAppliedToClient)) {
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, Number(lastUpdateID));
    }
    if (request && response) {
        return applyHTTPSOnyxUpdates(request, response).then(function () { return undefined; });
    }
    return Promise.resolve();
});
exports.apply = apply;
