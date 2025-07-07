"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ImageSVG_1 = require("@components/ImageSVG");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var variables_1 = require("@styles/variables");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceUserRestrictedAction(_a) {
    var _b;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(policyID);
    var styles = (0, useThemeStyles_1.default)();
    var openPolicyExpenseReport = (0, react_1.useCallback)(function () {
        var _a, _b;
        var reportID = (_b = (_a = ReportUtils.findPolicyExpenseChatByPolicyID(policyID)) === null || _a === void 0 ? void 0 : _a.reportID) !== null && _b !== void 0 ? _b : '-1';
        Navigation_1.default.closeRHPFlow();
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
    }, [policyID]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={WorkspaceUserRestrictedAction.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.restrictedAction.restricted')} onBackButtonPress={Navigation_1.default.goBack}/>
            <ScrollView_1.default style={[styles.p5, styles.pt0]} contentContainerStyle={styles.flexGrow1}>
                <react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.mb15]}>
                    <ImageSVG_1.default src={Illustrations.LockClosedOrange} width={variables_1.default.restrictedActionIllustrationHeight} height={variables_1.default.restrictedActionIllustrationHeight}/>
                    <Text_1.default style={[styles.textHeadlineH1, styles.textAlignCenter]}>
                        {translate('workspace.restrictedAction.actionsAreCurrentlyRestricted', { workspaceName: (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '' })}
                    </Text_1.default>
                    <Text_1.default style={[styles.textLabelSupportingEmptyValue, styles.textAlignCenter, styles.lh20, styles.mt2]}>
                        {translate('workspace.restrictedAction.pleaseReachOutToYourWorkspaceAdmin')}
                    </Text_1.default>
                </react_native_1.View>
                <Button_1.default text={translate('workspace.restrictedAction.chatWithYourAdmin')} onPress={openPolicyExpenseReport} success large/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
WorkspaceUserRestrictedAction.displayName = 'WorkspaceUserRestrictedAction';
exports.default = WorkspaceUserRestrictedAction;
