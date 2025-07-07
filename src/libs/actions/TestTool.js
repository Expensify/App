"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowProfileTool = shouldShowProfileTool;
var throttle_1 = require("lodash/throttle");
var Browser_1 = require("@libs/Browser");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var Modal_1 = require("./Modal");
/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
var throttledToggle = (0, throttle_1.default)(function () {
    var currentRoute = Navigation_1.default.getActiveRoute().replace(/^\//, '');
    if (currentRoute === ROUTES_1.default.TEST_TOOLS_MODAL) {
        Navigation_1.default.goBack();
        return;
    }
    var openTestToolsModal = function () {
        setTimeout(function () { return Navigation_1.default.navigate(ROUTES_1.default.TEST_TOOLS_MODAL); }, CONST_1.default.MODAL.ANIMATION_TIMING.DEFAULT_IN);
    };
    // Dismiss any current modal before showing test tools modal
    // We need to handle test drive modal differently using Navigation.goBack() to properly clean up its navigation state
    // Without this, the URL would revert to onboarding/test-drive or onboarding/test-drive/demo while the modal is already dismissed, leading to an unresponsive state
    if (currentRoute.includes('test-drive')) {
        Navigation_1.default.goBack();
        openTestToolsModal();
    }
    else {
        (0, Modal_1.close)(function () {
            openTestToolsModal();
        });
    }
}, CONST_1.default.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME, { leading: true, trailing: false });
function toggleTestToolsModal() {
    throttledToggle();
}
function shouldShowProfileTool() {
    var browser = (0, Browser_1.getBrowser)();
    var isSafariOrFirefox = browser === CONST_1.default.BROWSER.SAFARI || browser === CONST_1.default.BROWSER.FIREFOX;
    if (isSafariOrFirefox || (0, Browser_1.isChromeIOS)()) {
        return false;
    }
    return true;
}
exports.default = toggleTestToolsModal;
