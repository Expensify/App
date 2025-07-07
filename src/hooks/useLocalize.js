"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useLocalize;
var react_1 = require("react");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
function useLocalize() {
    return (0, react_1.useContext)(LocaleContextProvider_1.LocaleContext);
}
