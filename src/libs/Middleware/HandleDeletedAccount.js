"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Session_1 = require("@libs/actions/Session");
/**
 * Handles the case when the user's copilot has been deleted.
 * If the response contains jsonCode 408 and a message indicating copilot deletion,
 * the function signs the user out and redirects them to the sign-in page.
 */
var handleDeletedAccount = function (requestResponse) {
    return requestResponse.then(function (response) {
        var _a;
        if ((response === null || response === void 0 ? void 0 : response.jsonCode) !== 408 || !((_a = response === null || response === void 0 ? void 0 : response.message) === null || _a === void 0 ? void 0 : _a.includes('The account you are trying to use is deleted.'))) {
            return response;
        }
        (0, Session_1.signOutAndRedirectToSignIn)(true, false, false, true);
    });
};
exports.default = handleDeletedAccount;
