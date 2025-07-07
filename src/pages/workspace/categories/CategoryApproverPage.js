"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var WorkspaceMembersSelectionList_1 = require("@components/WorkspaceMembersSelectionList");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryUtils = require("@libs/CategoryUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function CategoryApproverPage(_a) {
    var _b, _c, _d, _e;
    var _f = _a.route.params, policyID = _f.policyID, categoryName = _f.categoryName;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(policyID);
    var selectedApprover = (_e = (_d = CategoryUtils.getCategoryApproverRule((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _b === void 0 ? void 0 : _b.approvalRules) !== null && _c !== void 0 ? _c : [], categoryName)) === null || _d === void 0 ? void 0 : _d.approver) !== null && _e !== void 0 ? _e : '';
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategoryApproverPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.categoryRules.approver')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); }}/>
                <WorkspaceMembersSelectionList_1.default policyID={policyID} selectedApprover={selectedApprover} setApprover={function (email) {
            Category.setPolicyCategoryApprover(policyID, categoryName, email);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); });
        }}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategoryApproverPage.displayName = 'CategoryApproverPage';
exports.default = CategoryApproverPage;
