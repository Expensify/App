"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemGroupContext = void 0;
var react_1 = require("react");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var MenuItemGroupContext = (0, react_1.createContext)(undefined);
exports.MenuItemGroupContext = MenuItemGroupContext;
function MenuItemGroup(_a) {
    var children = _a.children, _b = _a.shouldUseSingleExecution, shouldUseSingleExecution = _b === void 0 ? true : _b;
    var _c = (0, useSingleExecution_1.default)(), isExecuting = _c.isExecuting, singleExecution = _c.singleExecution;
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var value = (0, react_1.useMemo)(function () { return (shouldUseSingleExecution ? { isExecuting: isExecuting, singleExecution: singleExecution, waitForNavigate: waitForNavigate } : undefined); }, [shouldUseSingleExecution, isExecuting, singleExecution, waitForNavigate]);
    return <MenuItemGroupContext.Provider value={value}>{children}</MenuItemGroupContext.Provider>;
}
exports.default = MenuItemGroup;
