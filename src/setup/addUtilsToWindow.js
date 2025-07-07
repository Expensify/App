"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addUtilsToWindow;
var react_native_onyx_1 = require("react-native-onyx");
var Environment = require("@libs/Environment/Environment");
var markAllPolicyReportsAsRead_1 = require("@libs/markAllPolicyReportsAsRead");
var Session = require("@userActions/Session");
/**
 * This is used to inject development/debugging utilities into the window object on web and desktop.
 * We do this only on non-production builds - these should not be used in any application code.
 */
function addUtilsToWindow() {
    if (!window) {
        return;
    }
    Environment.isProduction().then(function (isProduction) {
        if (isProduction) {
            return;
        }
        window.Onyx = react_native_onyx_1.default;
        // We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging
        window.Onyx.get = function (key) {
            return new Promise(function (resolve) {
                // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
                var connection = react_native_onyx_1.default.connect({
                    key: key,
                    callback: function (value) {
                        react_native_onyx_1.default.disconnect(connection);
                        resolve(value);
                    },
                    waitForCollectionCallback: true,
                });
            });
        };
        window.Onyx.log = function (key) {
            window.Onyx.get(key).then(function (value) {
                /* eslint-disable-next-line no-console */
                console.log(value);
            });
        };
        window.setSupportToken = Session.setSupportAuthToken;
        // Workaround to give employees the ability to mark reports as read via the JS console
        window.markAllPolicyReportsAsRead = markAllPolicyReportsAsRead_1.default;
    });
}
