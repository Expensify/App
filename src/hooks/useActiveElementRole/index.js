"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ActiveElementRoleProvider_1 = require("@components/ActiveElementRoleProvider");
/**
 * Listens for the focusin and focusout events and sets the DOM activeElement to the state.
 * On native, we just return null.
 */
var useActiveElementRole = function () {
    var role = (0, react_1.useContext)(ActiveElementRoleProvider_1.ActiveElementRoleContext).role;
    return role;
};
exports.default = useActiveElementRole;
