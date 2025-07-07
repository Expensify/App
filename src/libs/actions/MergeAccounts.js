"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidationCodeForAccountMerge = requestValidationCodeForAccountMerge;
exports.clearGetValidateCodeForAccountMerge = clearGetValidateCodeForAccountMerge;
exports.mergeWithValidateCode = mergeWithValidateCode;
exports.clearMergeWithValidateCode = clearMergeWithValidateCode;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var session = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) { return (session = value !== null && value !== void 0 ? value : {}); },
});
function requestValidationCodeForAccountMerge(email, validateCodeResent) {
    var _a;
    if (validateCodeResent === void 0) { validateCodeResent = false; }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: true,
                    validateCodeSent: false,
                    validateCodeResent: false,
                    errors: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: !validateCodeResent,
                    validateCodeResent: validateCodeResent,
                    errors: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                getValidateCodeForAccountMerge: {
                    isLoading: false,
                    validateCodeSent: false,
                    validateCodeResent: false,
                },
            },
        },
    ];
    var parameters = {
        authToken: (_a = session.authToken) !== null && _a !== void 0 ? _a : '',
        email: email,
    };
    API.write(types_1.WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearGetValidateCodeForAccountMerge() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, {
        getValidateCodeForAccountMerge: {
            errors: null,
            validateCodeSent: false,
            validateCodeResent: false,
            isLoading: false,
        },
    });
}
function mergeWithValidateCode(email, validateCode) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: true,
                    isAccountMerged: false,
                    errors: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: false,
                    isAccountMerged: true,
                    errors: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                mergeWithValidateCode: {
                    isLoading: false,
                    isAccountMerged: false,
                },
            },
        },
    ];
    var parameters = {
        email: email,
        validateCode: validateCode,
    };
    API.write(types_1.WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearMergeWithValidateCode() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, {
        mergeWithValidateCode: {
            errors: null,
            isLoading: false,
            isAccountMerged: false,
        },
    });
}
