"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = backHistory;
var Browser_1 = require("@libs/Browser");
/**
 * This function is used to trigger a browser back navigation and calls the callback once the navigation is complete (only on mobile Chrome).
 * More details - https://github.com/Expensify/App/issues/58946.
 */
function backHistory(callback) {
    if (!(0, Browser_1.isMobileChrome)()) {
        callback();
        return;
    }
    var onPopState = function () {
        window.removeEventListener('popstate', onPopState);
        callback();
    };
    window.addEventListener('popstate', onPopState);
    window.history.back();
}
