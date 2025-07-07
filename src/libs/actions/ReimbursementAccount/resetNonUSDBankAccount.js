"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
function resetNonUSDBankAccount(policyID) {
    var _a;
    if (!policyID) {
        throw new Error('Missing Policy ID when attempting to reset');
    }
    var policy = (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) !== null && _a !== void 0 ? _a : {};
    API.write(types_1.WRITE_COMMANDS.RESET_BANK_ACCOUNT_SETUP, { policyID: policyID }, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: {
                    shouldShowResetModal: false,
                    isLoading: true,
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    achData: null,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    achAccount: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                value: null,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: CONST_1.default.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT,
                value: { isLoading: false, pendingAction: null },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    achAccount: policy === null || policy === void 0 ? void 0 : policy.achAccount,
                },
            },
        ],
    });
}
exports.default = resetNonUSDBankAccount;
