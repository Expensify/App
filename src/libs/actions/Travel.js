"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptSpotnanaTerms = acceptSpotnanaTerms;
exports.cleanupTravelProvisioningSession = cleanupTravelProvisioningSession;
exports.requestTravelAccess = requestTravelAccess;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms(domain) {
    var optimisticData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('travel.errorMessage'),
            },
        },
    ];
    var params = { domain: domain };
    API.write(types_1.WRITE_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function requestTravelAccess() {
    var optimisticData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS_1.default.NVP_TRAVEL_SETTINGS,
            value: {
                lastTravelSignupRequestTime: Date.now(),
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.TRAVEL_SIGNUP_REQUEST, null, { optimisticData: optimisticData });
}
function cleanupTravelProvisioningSession() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TRAVEL_PROVISIONING, null);
}
