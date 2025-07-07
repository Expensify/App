"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var waitForBatchedUpdates_1 = require("./waitForBatchedUpdates");
/**
 * When we change data in onyx, the listeners (components) will be notified
 * on the "next tick" (which is implemented by resolving a promise).
 * That means, that we have to wait for the next tick, until the components
 * are rendered with the onyx data.
 * This is a convenience function, which wraps the onyxInstance's
 * functions, to for the promises to resolve.
 */
function wrapOnyxWithWaitForBatchedUpdates(onyxInstance) {
    var multiSetImpl = onyxInstance.multiSet;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.multiSet = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return multiSetImpl.apply(void 0, args).then(function (result) { return (0, waitForBatchedUpdates_1.default)().then(function () { return result; }); });
    };
    var mergeImpl = onyxInstance.merge;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.merge = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return mergeImpl.apply(void 0, args).then(function (result) { return (0, waitForBatchedUpdates_1.default)().then(function () { return result; }); });
    };
}
exports.default = wrapOnyxWithWaitForBatchedUpdates;
