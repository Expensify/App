"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
function useDismissModalForUSD(workspaceCurrency) {
    var _a = (0, react_1.useState)(false), isCurrencyModalOpen = _a[0], setIsCurrencyModalOpen = _a[1];
    (0, react_1.useEffect)(function () {
        if (!isCurrencyModalOpen || workspaceCurrency !== CONST_1.default.CURRENCY.USD) {
            return;
        }
        setIsCurrencyModalOpen(false);
    }, [workspaceCurrency, isCurrencyModalOpen, setIsCurrencyModalOpen]);
    return [isCurrencyModalOpen, setIsCurrencyModalOpen];
}
exports.default = useDismissModalForUSD;
