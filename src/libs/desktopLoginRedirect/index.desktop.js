"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
function desktopLoginRedirect(autoAuthState, isSignedIn) {
    // NOT_STARTED - covers edge case of autoAuthState not being initialized yet (after logout)
    // JUST_SIGNED_IN - confirms passing the magic code step -> we're either logged-in or shown 2FA screen
    // !isSignedIn - confirms we're not signed-in yet as there's possible one last step (2FA validation)
    var shouldPopToTop = (autoAuthState === CONST_1.default.AUTO_AUTH_STATE.NOT_STARTED || autoAuthState === CONST_1.default.AUTO_AUTH_STATE.JUST_SIGNED_IN) && !isSignedIn;
    if (shouldPopToTop) {
        Navigation_1.default.isNavigationReady().then(function () { return Navigation_1.default.resetToHome(); });
    }
}
exports.default = desktopLoginRedirect;
