"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsMuted = exports.SOUNDS = void 0;
exports.withMinimalExecutionTime = withMinimalExecutionTime;
var react_native_onyx_1 = require("react-native-onyx");
var getPlatform_1 = require("@libs/getPlatform");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isMuted = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_MUTED_PLATFORMS,
    callback: function (val) {
        var platform = (0, getPlatform_1.default)(true);
        isMuted = !!(val === null || val === void 0 ? void 0 : val[platform]);
    },
});
var SOUNDS = {
    DONE: 'done',
    SUCCESS: 'success',
    ATTENTION: 'attention',
    RECEIVE: 'receive',
};
exports.SOUNDS = SOUNDS;
var getIsMuted = function () { return isMuted; };
exports.getIsMuted = getIsMuted;
/**
 * Creates a version of the given function that, when called, queues the execution and ensures that
 * calls are spaced out by at least the specified `minExecutionTime`, even if called more frequently. This allows
 * for throttling frequent calls to a function, ensuring each is executed with a minimum `minExecutionTime` between calls.
 * Each call returns a promise that resolves when the function call is executed, allowing for asynchronous handling.
 */
function withMinimalExecutionTime(func, minExecutionTime) {
    var queue = [];
    var timerId = null;
    function processQueue() {
        if (queue.length > 0) {
            var next = queue.shift();
            if (!next) {
                return;
            }
            var nextFunc = next[0], resolve = next[1];
            nextFunc();
            resolve();
            timerId = setTimeout(processQueue, minExecutionTime);
        }
        else {
            timerId = null;
        }
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve) {
            queue.push([function () { return func.apply(void 0, args); }, resolve]);
            if (!timerId) {
                // If the timer isn't running, start processing the queue
                processQueue();
            }
        });
    };
}
