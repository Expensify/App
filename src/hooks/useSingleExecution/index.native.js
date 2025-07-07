"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useSingleExecution;
var react_1 = require("react");
var react_native_1 = require("react-native");
/**
 * With any action passed in, it will only allow 1 such action to occur at a time.
 */
function useSingleExecution() {
    var _a = (0, react_1.useState)(false), isExecuting = _a[0], setIsExecuting = _a[1];
    var isExecutingRef = (0, react_1.useRef)(undefined);
    // eslint-disable-next-line react-compiler/react-compiler
    isExecutingRef.current = isExecuting;
    var singleExecution = (0, react_1.useCallback)(function (action) {
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            if (isExecutingRef.current) {
                return;
            }
            setIsExecuting(true);
            isExecutingRef.current = true;
            var execution = action.apply(void 0, params);
            react_native_1.InteractionManager.runAfterInteractions(function () {
                if (!(execution instanceof Promise)) {
                    setIsExecuting(false);
                    return;
                }
                execution.finally(function () {
                    setIsExecuting(false);
                });
            });
        };
    }, []);
    return { isExecuting: isExecuting, singleExecution: singleExecution };
}
