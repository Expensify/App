"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Plan_1 = require("@libs/actions/Policy/Plan");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/settings/Subscription/CardSection/utils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicy_1 = require("./withPolicy");
function WorkspaceOverviewPlanTypePage(_a) {
    var _b, _c;
    var policy = _a.policy;
    var _d = (0, react_1.useState)(policy === null || policy === void 0 ? void 0 : policy.type), currentPlan = _d[0], setCurrentPlan = _d[1];
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION)[0];
    (0, react_1.useEffect)(function () {
        if (!policyID) {
            return;
        }
        (0, Plan_1.default)(policyID);
    }, [policyID]);
    (0, react_1.useEffect)(function () {
        setCurrentPlan(policy === null || policy === void 0 ? void 0 : policy.type);
    }, [policy === null || policy === void 0 ? void 0 : policy.type]);
    var workspacePlanTypes = Object.values(CONST_1.default.POLICY.TYPE)
        .filter(function (type) { return type !== CONST_1.default.POLICY.TYPE.PERSONAL; })
        .map(function (policyType) { return ({
        value: policyType,
        text: translate("workspace.planTypePage.planTypes.".concat(policyType, ".label")),
        alternateText: translate("workspace.planTypePage.planTypes.".concat(policyType, ".description")),
        keyForList: policyType,
        isSelected: policyType === currentPlan,
    }); })
        .reverse();
    var isControl = (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE;
    var isAnnual = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL;
    var autoRenewalDate = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.endDate) ? (0, date_fns_1.format)(privateSubscription.endDate, CONST_1.default.DATE.MONTH_DAY_YEAR_ORDINAL_FORMAT) : utils_1.default.getNextBillingDate();
    /** If user has the annual Control plan and their first billing cycle is completed, they cannot downgrade the Workspace plan to Collect. */
    var isPlanTypeLocked = isControl && isAnnual && !policy.canDowngrade;
    var lockedIcon = function (option) {
        return option.value === (policy === null || policy === void 0 ? void 0 : policy.type) ? (<Icon_1.default src={Expensicons.Lock} fill={theme.success}/>) : null;
    };
    var handleUpdatePlan = function () {
        if (policyID && (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.TEAM && currentPlan === CONST_1.default.POLICY.TYPE.CORPORATE) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID));
            return;
        }
        if (policyID && (policy === null || policy === void 0 ? void 0 : policy.type) === CONST_1.default.POLICY.TYPE.CORPORATE && currentPlan === CONST_1.default.POLICY.TYPE.TEAM) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DOWNGRADE.getRoute(policyID));
            return;
        }
        if ((policy === null || policy === void 0 ? void 0 : policy.type) === currentPlan) {
            Navigation_1.default.goBack();
        }
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]}>
            <ScreenWrapper_1.default testID={WorkspaceOverviewPlanTypePage.displayName} shouldShowOfflineIndicatorInWideScreen enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.common.planType')}/>
                {(policy === null || policy === void 0 ? void 0 : policy.isLoading) ? (<react_native_1.View style={styles.flex1}>
                        <FullscreenLoadingIndicator_1.default />
                    </react_native_1.View>) : (<>
                        {isPlanTypeLocked ? (<Text_1.default style={[styles.mh5, styles.mv3]}>
                                {translate('workspace.planTypePage.lockedPlanDescription', {
                    count: (_b = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _b !== void 0 ? _b : 1,
                    annualSubscriptionEndDate: autoRenewalDate,
                })}{' '}
                                <TextLink_1.default onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.getRoute(Navigation_1.default.getActiveRoute())); }}>
                                    {translate('workspace.planTypePage.subscriptions')}
                                </TextLink_1.default>
                                .
                            </Text_1.default>) : (<Text_1.default style={[styles.mh5, styles.mv3]}>
                                {translate('workspace.planTypePage.description')}{' '}
                                <TextLink_1.default href={CONST_1.default.PLAN_TYPES_AND_PRICING_HELP_URL}>{translate('workspace.planTypePage.subscriptionLink')}</TextLink_1.default>.
                            </Text_1.default>)}
                        <SelectionList_1.default shouldIgnoreFocus sections={[{ data: workspacePlanTypes, isDisabled: isPlanTypeLocked }]} ListItem={RadioListItem_1.default} onSelectRow={function (option) {
                setCurrentPlan(option.value);
            }} rightHandSideComponent={isPlanTypeLocked ? lockedIcon : null} shouldUpdateFocusedIndex shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_c = workspacePlanTypes.find(function (mode) { return mode.isSelected; })) === null || _c === void 0 ? void 0 : _c.keyForList} addBottomSafeAreaPadding footerContent={<Button_1.default success large text={isPlanTypeLocked ? translate('common.buttonConfirm') : translate('common.save')} style={styles.mt6} onPress={handleUpdatePlan}/>}/>
                    </>)}
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOverviewPlanTypePage.displayName = 'WorkspaceOverviewPlanTypePage';
exports.default = (0, withPolicy_1.default)(WorkspaceOverviewPlanTypePage);
