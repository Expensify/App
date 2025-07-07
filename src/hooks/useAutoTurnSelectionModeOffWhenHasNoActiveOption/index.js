"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var usePrevious_1 = require("@hooks/usePrevious");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var useAutoTurnSelectionModeOffWhenHasNoActiveOption = function (listItem) {
    var hasActiveOption = listItem.some(function (item) { return !item.isDisabled; });
    var prevHasActiveOption = (0, usePrevious_1.default)(hasActiveOption);
    (0, react_1.useEffect)(function () {
        if (hasActiveOption || !prevHasActiveOption) {
            return;
        }
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }, [hasActiveOption, prevHasActiveOption]);
};
exports.default = useAutoTurnSelectionModeOffWhenHasNoActiveOption;
