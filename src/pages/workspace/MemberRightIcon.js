"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MemberRightIcon;
var react_1 = require("react");
var Badge_1 = require("@components/Badge");
var useLocalize_1 = require("@hooks/useLocalize");
var CONST_1 = require("@src/CONST");
function MemberRightIcon(_a) {
    var role = _a.role, owner = _a.owner, login = _a.login;
    var translate = (0, useLocalize_1.default)().translate;
    var badgeText;
    if (owner && owner === login) {
        badgeText = 'common.owner';
    }
    else if (role === CONST_1.default.POLICY.ROLE.ADMIN) {
        badgeText = 'common.admin';
    }
    else if (role === CONST_1.default.POLICY.ROLE.AUDITOR) {
        badgeText = 'common.auditor';
    }
    if (badgeText) {
        return <Badge_1.default text={translate(badgeText)}/>;
    }
    return null;
}
