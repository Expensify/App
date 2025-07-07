"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function RulesBillableDefaultPage(_a) {
    var policyID = _a.route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var billableModes = [
        {
            value: true,
            text: translate("workspace.rules.individualExpenseRules.billable"),
            alternateText: translate("workspace.rules.individualExpenseRules.billableDescription"),
            keyForList: CONST_1.default.POLICY_BILLABLE_MODES.BILLABLE,
            isSelected: policy === null || policy === void 0 ? void 0 : policy.defaultBillable,
        },
        {
            value: false,
            text: translate("workspace.rules.individualExpenseRules.nonBillable"),
            alternateText: translate("workspace.rules.individualExpenseRules.nonBillableDescription"),
            keyForList: CONST_1.default.POLICY_BILLABLE_MODES.NON_BILLABLE,
            isSelected: !(policy === null || policy === void 0 ? void 0 : policy.defaultBillable),
        },
    ];
    var initiallyFocusedOptionKey = (policy === null || policy === void 0 ? void 0 : policy.defaultBillable) ? CONST_1.default.POLICY_BILLABLE_MODES.BILLABLE : CONST_1.default.POLICY_BILLABLE_MODES.NON_BILLABLE;
    var handleOnPressTagsLink = function () {
        if (policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesBillableDefaultPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.individualExpenseRules.billableDefault')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.billableDefaultDescription')}</Text_1.default>{' '}
                    <TextLink_1.default style={styles.link} onPress={handleOnPressTagsLink}>
                        {translate('workspace.common.tags').toLowerCase()}
                    </TextLink_1.default>
                    .
                </Text_1.default>
                <SelectionList_1.default sections={[{ data: billableModes }]} ListItem={RadioListItem_1.default} onSelectRow={function (item) {
            Policy.setPolicyBillableMode(policyID, item.value);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} shouldSingleExecuteRowSelect containerStyle={[styles.pt3]} initiallyFocusedOptionKey={initiallyFocusedOptionKey} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesBillableDefaultPage.displayName = 'RulesBillableDefaultPage';
exports.default = RulesBillableDefaultPage;
