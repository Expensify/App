"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var MemberActions = require("@userActions/Policy/Member");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceOwnerChangeErrorPage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var accountID = (_b = Number(route.params.accountID)) !== null && _b !== void 0 ? _b : -1;
    var policyID = route.params.policyID;
    var closePage = (0, react_1.useCallback)(function () {
        MemberActions.clearWorkspaceOwnerChangeFlow(policyID);
        Navigation_1.default.goBack();
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID}>
            <ScreenWrapper_1.default testID={WorkspaceOwnerChangeErrorPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.changeOwner.changeOwnerPageTitle')} onBackButtonPress={closePage}/>
                <react_native_1.View style={[styles.screenCenteredContainer, styles.alignItemsCenter]}>
                    <Icon_1.default src={Expensicons.MoneyWaving} width={187} height={173} fill="" additionalStyles={styles.mb3}/>
                    <Text_1.default style={[styles.textHeadline, styles.textAlignCenter, styles.mv2]}>{translate('workspace.changeOwner.errorTitle')}</Text_1.default>
                    <Text_1.default style={[styles.textAlignCenter, styles.textSupporting]}>
                        {translate('workspace.changeOwner.errorDescriptionPartOne')}{' '}
                        <TextLink_1.default href={"mailto:".concat(CONST_1.default.EMAIL.CONCIERGE)}>{translate('workspace.changeOwner.errorDescriptionPartTwo')}</TextLink_1.default>{' '}
                        {translate('workspace.changeOwner.errorDescriptionPartThree')}
                    </Text_1.default>
                </react_native_1.View>
                <FixedFooter_1.default addBottomSafeAreaPadding>
                    <Button_1.default success large text={translate('common.buttonConfirm')} style={styles.mt6} pressOnEnter onPress={closePage}/>
                </FixedFooter_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOwnerChangeErrorPage.displayName = 'WorkspaceOwnerChangeErrorPage';
exports.default = WorkspaceOwnerChangeErrorPage;
