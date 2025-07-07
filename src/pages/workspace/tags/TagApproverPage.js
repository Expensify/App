"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var WorkspaceMembersSelectionList_1 = require("@components/WorkspaceMembersSelectionList");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Tag_1 = require("@libs/actions/Policy/Tag");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function TagApproverPage(_a) {
    var _b;
    var route = _a.route;
    var _c = route.params, policyID = _c.policyID, tagName = _c.tagName, orderWeight = _c.orderWeight, backTo = _c.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(policyID);
    var tagApprover = (_b = (0, PolicyUtils_1.getTagApproverRule)(policy, tagName)) === null || _b === void 0 ? void 0 : _b.approver;
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAG_APPROVER;
    var goBack = function () {
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName, backTo) : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={TagApproverPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.tags.approverDescription')} onBackButtonPress={goBack}/>
                <WorkspaceMembersSelectionList_1.default policyID={policyID} selectedApprover={tagApprover !== null && tagApprover !== void 0 ? tagApprover : ''} setApprover={function (email) {
            (0, Tag_1.setPolicyTagApprover)(policyID, tagName, email);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(goBack);
        }}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
TagApproverPage.displayName = 'TagApproverPage';
exports.default = TagApproverPage;
