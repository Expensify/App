"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var WorkspaceConfirmationForm_1 = require("@components/WorkspaceConfirmationForm");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var App_1 = require("@libs/actions/App");
var Policy_1 = require("@libs/actions/Policy/Policy");
var currentUrl_1 = require("@libs/Navigation/currentUrl");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceConfirmationPage() {
    var _a;
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var onSubmit = function (params) {
        var policyID = params.policyID || (0, Policy_1.generatePolicyID)();
        var routeToNavigate = isSmallScreenWidth ? ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES_1.default.WORKSPACE_OVERVIEW.getRoute(policyID);
        (0, App_1.createWorkspaceWithPolicyDraftAndNavigateToIt)('', params.name, false, false, '', policyID, params.currency, params.avatarFile, routeToNavigate);
    };
    var currentUrl = (0, currentUrl_1.default)();
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    var policyOwnerEmail = currentUrl ? ((_a = new URL(currentUrl).searchParams.get('ownerEmail')) !== null && _a !== void 0 ? _a : '') : '';
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceConfirmationPage.displayName}>
            <WorkspaceConfirmationForm_1.default policyOwnerEmail={policyOwnerEmail} onSubmit={onSubmit}/>
        </ScreenWrapper_1.default>);
}
WorkspaceConfirmationPage.displayName = 'WorkspaceConfirmationPage';
exports.default = WorkspaceConfirmationPage;
