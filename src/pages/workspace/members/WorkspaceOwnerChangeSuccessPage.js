"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Member_1 = require("@userActions/Policy/Member");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceOwnerChangeSuccessPage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var accountID = (_b = Number(route.params.accountID)) !== null && _b !== void 0 ? _b : -1;
    var policyID = route.params.policyID;
    var closePage = (0, react_1.useCallback)(function () {
        (0, Member_1.clearWorkspaceOwnerChangeFlow)(policyID);
        Navigation_1.default.goBack();
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID}>
            <ScreenWrapper_1.default testID={WorkspaceOwnerChangeSuccessPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.changeOwner.changeOwnerPageTitle')} onBackButtonPress={closePage}/>
                <ConfirmationPage_1.default illustration={LottieAnimations_1.default.Fireworks} heading={translate('workspace.changeOwner.successTitle')} description={translate('workspace.changeOwner.successDescription')} descriptionStyle={styles.textSupporting} shouldShowButton buttonText={translate('common.buttonConfirm')} onButtonPress={closePage}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOwnerChangeSuccessPage.displayName = 'WorkspaceOwnerChangeSuccessPage';
exports.default = WorkspaceOwnerChangeSuccessPage;
