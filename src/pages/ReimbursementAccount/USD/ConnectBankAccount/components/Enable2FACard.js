"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function Enable2FACard(_a) {
    var policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<Section_1.default title={translate('validationStep.enable2FATitle')} icon={Illustrations_1.ShieldYellow} titleStyles={[styles.mb4]} containerStyles={[styles.mh5]} menuItems={[
            {
                title: translate('validationStep.secureYourAccount'),
                onPress: function () {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID)));
                },
                icon: Expensicons_1.Shield,
                shouldShowRightIcon: true,
                outerWrapperStyle: shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
            },
        ]}>
            <react_native_1.View style={styles.mb6}>
                <Text_1.default>{translate('validationStep.enable2FAText')}</Text_1.default>
            </react_native_1.View>
        </Section_1.default>);
}
Enable2FACard.displayName = 'Enable2FAPrompt';
exports.default = Enable2FACard;
