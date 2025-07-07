"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useInitialValue;
var react_1 = require("react");
// In some places we set initial value on first render, but we don't want to re-run the function
// This hook will memoize the initial value and return that without setter, so it's never changed
// https://github.com/Expensify/App/pull/29643#issuecomment-1765894078
function useInitialValue(initialStateFunc) {
    var initialValue = (0, react_1.useState)(initialStateFunc)[0];
    return initialValue;
}
