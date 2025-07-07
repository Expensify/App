"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItem_1 = require("@components/MenuItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var Report_1 = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function Finish() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var policyID = (_a = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _a === void 0 ? void 0 : _a.policyID;
    var handleBackButtonPress = function () {
        Navigation_1.default.goBack();
    };
    var handleNavigateToConciergeChat = function () { return (0, Report_1.navigateToConciergeChat)(true); };
    return (<ScreenWrapper_1.default testID={Finish.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('finishStep.connect')} onBackButtonPress={handleBackButtonPress}/>
            <ScrollView_1.default style={[styles.flex1]}>
                <Section_1.default title={translate('finishStep.letsFinish')} icon={Illustrations.ConciergeBubble} containerStyles={[styles.mb8, styles.mh5]} titleStyles={[styles.mb3, styles.textHeadline]}>
                    <Text_1.default style={[styles.mb6, styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.thanksFor')}</Text_1.default>
                    <MenuItem_1.default icon={Expensicons_1.ChatBubble} title={translate('finishStep.iHaveA')} onPress={handleNavigateToConciergeChat} outerWrapperStyle={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8} shouldShowRightIcon/>
                </Section_1.default>
                <Section_1.default title={translate('finishStep.enable2FA')} icon={Illustrations.ShieldYellow} titleStyles={[styles.mb4, styles.textHeadline]} containerStyles={[styles.mh5]} menuItems={[
            {
                title: translate('finishStep.secure'),
                onPress: function () {
                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID)));
                },
                icon: Expensicons.Shield,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
                outerWrapperStyle: shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
            },
        ]}>
                    <react_native_1.View style={styles.mb6}>
                        <Text_1.default style={[styles.mt3, styles.textLabelSupportingEmptyValue]}>{translate('finishStep.weTake')}</Text_1.default>
                    </react_native_1.View>
                </Section_1.default>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
Finish.displayName = 'Finish';
exports.default = Finish;
