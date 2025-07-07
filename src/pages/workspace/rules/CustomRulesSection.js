"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Section_1 = require("@components/Section");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function CustomRulesSection(_a) {
    var _b;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(policyID);
    var parsedRules = (_b = policy === null || policy === void 0 ? void 0 : policy.customRules) !== null && _b !== void 0 ? _b : '';
    var rulesDescription = typeof parsedRules === 'string' ? parsedRules : '';
    return (<Section_1.default isCentralPane title={translate('workspace.rules.customRules.title')} subtitle={translate('workspace.rules.customRules.description')} titleStyles={styles.accountSettingsSectionTitle} subtitleMuted>
            <react_native_1.View style={[styles.mt3]}>
                {/* <OfflineWithFeedback
            pendingAction={policy?.pendingFields?.customRules}
            errors={policy?.errors?.customRules}
        > */}
                <MenuItemWithTopDescription_1.default title={rulesDescription} description={translate('workspace.rules.customRules.subtitle')} shouldShowRightIcon interactive wrapperStyle={styles.sectionMenuItemTopDescription} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_CUSTOM.getRoute(policyID)); }} shouldRenderAsHTML/>
                {/* </OfflineWithFeedback> */}
            </react_native_1.View>
        </Section_1.default>);
}
exports.default = CustomRulesSection;
