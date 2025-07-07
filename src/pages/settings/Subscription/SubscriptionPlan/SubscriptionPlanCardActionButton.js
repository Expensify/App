"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var AddMembersButton_1 = require("./AddMembersButton");
function SubscriptionPlanCardActionButton(_a) {
    var _b;
    var subscriptionPlan = _a.subscriptionPlan, isFromComparisonModal = _a.isFromComparisonModal, isSelected = _a.isSelected, closeComparisonModal = _a.closeComparisonModal, style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var currentUserAccountID = (0, Report_1.getCurrentUserAccountID)();
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: false })[0];
    var isAnnual = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL;
    var ownerPolicies = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getOwnedPaidPolicies)(policies, currentUserAccountID); }, [policies, currentUserAccountID]);
    var _c = (0, react_1.useMemo)(function () {
        var firstPolicy = ownerPolicies.at(0);
        if (!firstPolicy || ownerPolicies.length > 1) {
            return [false, undefined];
        }
        return [(0, PolicyUtils_1.canModifyPlan)(firstPolicy.id), firstPolicy];
    }, [ownerPolicies]), canPerformUpgrade = _c[0], policy = _c[1];
    var handlePlanPress = function (planType) {
        closeComparisonModal === null || closeComparisonModal === void 0 ? void 0 : closeComparisonModal();
        // If user has no policies, return.
        if (!ownerPolicies.length) {
            return;
        }
        if (planType === CONST_1.default.POLICY.TYPE.TEAM) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DOWNGRADE.getRoute(policy === null || policy === void 0 ? void 0 : policy.id, Navigation_1.default.getActiveRoute()));
            return;
        }
        if (planType === CONST_1.default.POLICY.TYPE.CORPORATE) {
            if (canPerformUpgrade && !!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                (0, Policy_1.upgradeToCorporate)(policy.id);
                closeComparisonModal === null || closeComparisonModal === void 0 ? void 0 : closeComparisonModal();
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policy === null || policy === void 0 ? void 0 : policy.id, undefined, Navigation_1.default.getActiveRoute()));
        }
    };
    var currentPlanLabel = (<react_native_1.View style={style}>
            <react_native_1.View style={[styles.button, styles.buttonContainer, styles.outlinedButton]}>
                <Text_1.default style={styles.textLabelSupporting}>{translate('subscription.yourPlan.thisIsYourCurrentPlan')}</Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
    if (subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (<Button_1.default text={translate('subscription.yourPlan.downgrade')} style={style} onPress={function () { return handlePlanPress(CONST_1.default.POLICY.TYPE.TEAM); }}/>);
        }
        if (hasTeam2025Pricing) {
            return <AddMembersButton_1.default />;
        }
    }
    if (subscriptionPlan === CONST_1.default.POLICY.TYPE.CORPORATE) {
        if (isFromComparisonModal) {
            if (isSelected) {
                return currentPlanLabel;
            }
            return (<Button_1.default success style={style} text={translate('subscription.yourPlan.upgrade')} onPress={function () { return handlePlanPress(CONST_1.default.POLICY.TYPE.CORPORATE); }}/>);
        }
    }
    var autoIncrease = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.addNewUsersAutomatically) ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');
    var subscriptionType = isAnnual ? translate('subscription.subscriptionSettings.annual') : translate('subscription.details.payPerUse');
    var subscriptionSize = "".concat((_b = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _b !== void 0 ? _b : translate('subscription.subscriptionSettings.none'));
    var autoRenew = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.autoRenew) ? translate('subscription.subscriptionSettings.on') : translate('subscription.subscriptionSettings.off');
    return (<MenuItemWithTopDescription_1.default description={translate('subscription.subscriptionSettings.title')} style={style} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS); }} numberOfLinesTitle={3} title={translate('subscription.subscriptionSettings.summary', { subscriptionType: subscriptionType, subscriptionSize: subscriptionSize, autoRenew: autoRenew, autoIncrease: autoIncrease })}/>);
}
exports.default = SubscriptionPlanCardActionButton;
