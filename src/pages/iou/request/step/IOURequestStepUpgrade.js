"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var UpgradeConfirmation_1 = require("@pages/workspace/upgrade/UpgradeConfirmation");
var UpgradeIntro_1 = require("@pages/workspace/upgrade/UpgradeIntro");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var Policy = require("@src/libs/actions/Policy/Policy");
var ROUTES_1 = require("@src/ROUTES");
function IOURequestStepUpgrade(_a) {
    var _b = _a.route.params, transactionID = _b.transactionID, action = _b.action;
    var styles = (0, useThemeStyles_1.default)();
    var feature = CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.categories;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, react_1.useState)(false), isUpgraded = _c[0], setIsUpgraded = _c[1];
    var policyDataRef = (0, react_1.useRef)(null);
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator testID="workspaceUpgradePage" offlineIndicatorStyle={styles.mtAuto}>
            <HeaderWithBackButton_1.default title={translate('common.upgrade')} onBackButtonPress={function () {
            Navigation_1.default.goBack();
        }}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                {!!isUpgraded && (<UpgradeConfirmation_1.default onConfirmUpgrade={function () {
                var _a, _b, _c, _d;
                (0, IOU_1.setMoneyRequestParticipants)(transactionID, [
                    {
                        selected: true,
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: (_a = policyDataRef.current) === null || _a === void 0 ? void 0 : _a.expenseChatReportID,
                        policyID: (_b = policyDataRef.current) === null || _b === void 0 ? void 0 : _b.policyID,
                        searchText: (_c = policyDataRef.current) === null || _c === void 0 ? void 0 : _c.policyName,
                    },
                ]);
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST_1.default.IOU.TYPE.SUBMIT, transactionID, (_d = policyDataRef.current) === null || _d === void 0 ? void 0 : _d.expenseChatReportID));
            }} policyName="" isCategorizing/>)}
                {!isUpgraded && (<UpgradeIntro_1.default feature={feature} onUpgrade={function () {
                var policyData = Policy.createWorkspace('', false, '', undefined, CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE);
                setIsUpgraded(true);
                policyDataRef.current = policyData;
            }} buttonDisabled={isOffline} loading={false} isCategorizing/>)}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
exports.default = IOURequestStepUpgrade;
