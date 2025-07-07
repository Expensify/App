"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useMobileSelectionMode;
var react_1 = require("react");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useMobileSelectionMode() {
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE)[0];
    (0, react_1.useEffect)(function () {
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }, []);
    return { selectionMode: selectionMode };
}
