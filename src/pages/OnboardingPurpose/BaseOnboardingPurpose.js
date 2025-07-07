"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemList_1 = require("@components/MenuItemList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OnboardingRefManager_1 = require("@libs/OnboardingRefManager");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var selectableOnboardingChoices = Object.values(CONST_1.default.SELECTABLE_ONBOARDING_CHOICES);
function getOnboardingChoices(customChoices) {
    if (customChoices.length === 0) {
        return selectableOnboardingChoices;
    }
    return selectableOnboardingChoices.filter(function (choice) { return customChoices.includes(choice); });
}
var menuIcons = (_a = {},
    _a[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = Illustrations.ReceiptUpload,
    _a[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = Illustrations.Abacus,
    _a[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = Illustrations.PiggyBank,
    _a[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = Illustrations.SplitBill,
    _a[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = Illustrations.Binoculars,
    _a);
function BaseOnboardingPurpose(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles, shouldEnableMaxHeight = _a.shouldEnableMaxHeight, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    var isPrivateDomainAndHasAccessiblePolicies = !(account === null || account === void 0 ? void 0 : account.isFromPublicDomain) && !!(account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies);
    var theme = (0, useTheme_1.default)();
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE, { canBeMissing: true }), onboardingErrorMessage = _b[0], onboardingErrorMessageResult = _b[1];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var personalDetailsForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, { canBeMissing: true })[0];
    var paddingHorizontal = onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_CUSTOM_CHOICES, { canBeMissing: true })[0], customChoices = _c === void 0 ? [] : _c;
    var onboardingChoices = getOnboardingChoices(customChoices);
    var menuItems = onboardingChoices.map(function (choice) {
        var translationKey = "onboarding.purpose.".concat(choice);
        return {
            key: translationKey,
            title: translate(translationKey),
            icon: menuIcons[choice],
            displayInDefaultIconColor: true,
            iconWidth: variables_1.default.menuIconSize,
            iconHeight: variables_1.default.menuIconSize,
            iconStyles: [styles.mh3],
            wrapperStyle: [styles.purposeMenuItem],
            numberOfLinesTitle: 0,
            onPress: function () {
                var _a, _b;
                (0, Welcome_1.setOnboardingPurposeSelected)(choice);
                (0, Welcome_1.setOnboardingErrorMessage)('');
                if (choice === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM) {
                    Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_EMPLOYEES.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo));
                    return;
                }
                if (isPrivateDomainAndHasAccessiblePolicies && (personalDetailsForm === null || personalDetailsForm === void 0 ? void 0 : personalDetailsForm.firstName)) {
                    (0, Report_1.completeOnboarding)({
                        engagementChoice: choice,
                        onboardingMessage: onboardingMessages[choice],
                        firstName: personalDetailsForm.firstName,
                        lastName: personalDetailsForm.lastName,
                        adminsChatReportID: onboardingAdminsChatReportID !== null && onboardingAdminsChatReportID !== void 0 ? onboardingAdminsChatReportID : undefined,
                        onboardingPolicyID: onboardingPolicyID,
                    });
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        Navigation_1.default.navigate(ROUTES_1.default.TEST_DRIVE_MODAL_ROOT.route);
                    });
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PERSONAL_DETAILS.getRoute((_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo));
            },
        };
    });
    var isFocused = (0, native_1.useIsFocused)();
    var handleOuterClick = (0, react_1.useCallback)(function () {
        (0, Welcome_1.setOnboardingErrorMessage)(translate('onboarding.errorSelection'));
    }, [translate]);
    var onboardingLocalRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(isFocused ? OnboardingRefManager_1.default.ref : onboardingLocalRef, function () { return ({ handleOuterClick: handleOuterClick }); }, [handleOuterClick]);
    if ((0, isLoadingOnyxValue_1.default)(onboardingErrorMessageResult)) {
        return null;
    }
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID="BaseOnboardingPurpose" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]} shouldEnableMaxHeight={shouldEnableMaxHeight}>
            <react_native_1.View style={onboardingIsMediumOrLargerScreenWidth && styles.mh3}>
                <HeaderWithBackButton_1.default shouldShowBackButton={false} iconFill={theme.iconColorfulBackground} progressBarPercentage={isPrivateDomainAndHasAccessiblePolicies ? 60 : 20}/>
            </react_native_1.View>
            <react_native_gesture_handler_1.ScrollView style={[styles.flex1, styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, paddingHorizontal]}>
                <react_native_1.View style={styles.flex1}>
                    <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.purpose.title')} </Text_1.default>
                    </react_native_1.View>
                    <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
                </react_native_1.View>
            </react_native_gesture_handler_1.ScrollView>
            <react_native_1.View style={[styles.w100, styles.mb5, styles.mh0, paddingHorizontal]}>
                <FormHelpMessage_1.default message={onboardingErrorMessage}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
BaseOnboardingPurpose.displayName = 'BaseOnboardingPurpose';
exports.default = BaseOnboardingPurpose;
