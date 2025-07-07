"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function AddMembersButton() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var activePolicy = (0, usePolicy_1.default)(activePolicyID);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    if (!activePolicy || activePolicy.type === CONST_1.default.POLICY.TYPE.PERSONAL) {
        return null;
    }
    return (<Button_1.default text={translate('subscription.yourPlan.addMembers')} style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8} icon={Expensicons.UserPlus} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(activePolicyID)); }}/>);
}
exports.default = AddMembersButton;
