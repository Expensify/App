"use strict";
exports.__esModule = true;
function setNavigationActionToMicrotaskQueue(navigationAction) {
    /**
     * The function is used when the app needs to set a navigation action to the microtask queue, it guarantees to execute Onyx.update first, then the navigation action.
     * More details - https://github.com/Expensify/App/issues/37785#issuecomment-1989056726.
     */
    new Promise(function (resolve) {
        resolve();
    }).then(function () {
        requestAnimationFrame(function () {
            navigationAction();
        });
    });
}
exports["default"] = setNavigationActionToMicrotaskQueue;
