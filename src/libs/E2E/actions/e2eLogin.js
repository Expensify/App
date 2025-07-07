"use strict";
/* eslint-disable rulesdir/prefer-actions-set-data */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
var react_native_onyx_1 = require("react-native-onyx");
var Authentication_1 = require("@libs/Authentication");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var e2eUserCredentials = {
    email: (0, getConfigValueOrThrow_1.default)('EXPENSIFY_PARTNER_PASSWORD_EMAIL'),
    partnerUserID: (0, getConfigValueOrThrow_1.default)('EXPENSIFY_PARTNER_USER_ID'),
    partnerUserSecret: (0, getConfigValueOrThrow_1.default)('EXPENSIFY_PARTNER_USER_SECRET'),
    partnerName: CONFIG_1.default.EXPENSIFY.PARTNER_NAME,
    partnerPassword: CONFIG_1.default.EXPENSIFY.PARTNER_PASSWORD,
};
/**
 * Command for e2e test to automatically sign in a user.
 * If the user is already logged in the function will simply
 * resolve.
 *
 * @return Resolved true when the user was actually signed in. Returns false if the user was already logged in.
 */
function default_1() {
    var waitForBeginSignInToFinish = function () {
        return new Promise(function (resolve) {
            var id = react_native_onyx_1.default.connect({
                key: ONYXKEYS_1.default.CREDENTIALS,
                callback: function (credentials) {
                    // beginSignUp writes to credentials.login once the API call is complete
                    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
                        return;
                    }
                    resolve();
                    react_native_onyx_1.default.disconnect(id);
                },
            });
        });
    };
    var neededLogin = false;
    // Subscribe to auth token, to check if we are authenticated
    return new Promise(function (resolve, reject) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.SESSION,
            callback: function (session) {
                if ((session === null || session === void 0 ? void 0 : session.authToken) == null || session.authToken.length === 0) {
                    neededLogin = true;
                    // authenticate with a predefined user
                    console.debug('[E2E] Signing in…');
                    (0, Authentication_1.Authenticate)(e2eUserCredentials)
                        .then(function (response) {
                        if (!response) {
                            return;
                        }
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, {
                            authToken: response.authToken,
                            creationDate: new Date().getTime(),
                            email: e2eUserCredentials.email,
                        });
                        console.debug('[E2E] Signed in finished!');
                        return waitForBeginSignInToFinish();
                    })
                        .catch(function (error) {
                        console.error('[E2E] Error while signing in', error);
                        reject(error);
                    });
                }
                // signal that auth was completed
                resolve(neededLogin);
                react_native_onyx_1.default.disconnect(connection);
            },
        });
    });
}
