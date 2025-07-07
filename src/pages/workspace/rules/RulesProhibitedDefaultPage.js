"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
function RulesProhibitedDefaultPage(_a) {
    var policyID = _a.route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesProhibitedDefaultPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.individualExpenseRules.prohibitedExpenses')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <ScrollView_1.default addBottomSafeAreaPadding>
                    <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.prohibitedDefaultDescription')}</Text_1.default>
                    </Text_1.default>

                    {Object.values(CONST_1.default.POLICY.PROHIBITED_EXPENSES).map(function (prohibitedExpense) {
            var _a, _b, _c, _d;
            return (<OfflineWithFeedback_1.default pendingAction={(_b = (_a = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _a === void 0 ? void 0 : _a.pendingFields) === null || _b === void 0 ? void 0 : _b[prohibitedExpense]} key={translate("workspace.rules.individualExpenseRules.".concat(prohibitedExpense))}>
                            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mt3, styles.mh5, styles.mb5]}>
                                <Text_1.default>{translate("workspace.rules.individualExpenseRules.".concat(prohibitedExpense))}</Text_1.default>
                                <Switch_1.default isOn={(_d = (_c = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _c === void 0 ? void 0 : _c[prohibitedExpense]) !== null && _d !== void 0 ? _d : false} accessibilityLabel={translate("workspace.rules.individualExpenseRules.".concat(prohibitedExpense))} onToggle={function () {
                    (0, Policy_1.setPolicyProhibitedExpense)(policyID, prohibitedExpense);
                }}/>
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>);
        })}
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesProhibitedDefaultPage.displayName = 'RulesProhibitedDefaultPage';
exports.default = RulesProhibitedDefaultPage;
