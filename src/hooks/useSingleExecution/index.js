"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useSingleExecution;
var react_1 = require("react");
/**
 * This hook was specifically written for native issue
 * more information: https://github.com/Expensify/App/pull/24614 https://github.com/Expensify/App/pull/24173
 * on web we don't need this mechanism so we just call the action directly.
 */
function useSingleExecution() {
    var singleExecution = (0, react_1.useCallback)(function (action) {
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            action === null || action === void 0 ? void 0 : action.apply(void 0, params);
        };
    }, []);
    return { isExecuting: false, singleExecution: singleExecution };
}
