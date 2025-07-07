"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Report_1 = require("@userActions/Report");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseOnboardingWorkspaceOptional(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var conciergeChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.CONCIERGE_REPORT_ID, { canBeMissing: true })[0];
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    var mergedAccountConciergeReportID = !(onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldRedirectToClassicAfterMerge) && (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldValidate) ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), onboardingIsMediumOrLargerScreenWidth = _b.onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth = _b.isSmallScreenWidth;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var ICON_SIZE = 48;
    var processedHelperText = "<comment><muted-text-label>".concat(translate('onboarding.workspace.price'), "</muted-text-label></comment>");
    (0, react_1.useEffect)(function () {
        (0, Welcome_1.setOnboardingErrorMessage)('');
    }, []);
    var section = [
        {
            icon: Illustrations.MoneyReceipts,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionOne',
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionTwo',
        },
        {
            icon: Illustrations.ReportReceipt,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionThree',
        },
    ];
    var completeOnboarding = (0, react_1.useCallback)(function () {
        if (!onboardingPurposeSelected) {
            return;
        }
        (0, Report_1.completeOnboarding)({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: onboardingMessages[onboardingPurposeSelected],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID: onboardingPolicyID,
        });
        (0, Welcome_1.setOnboardingAdminsChatReportID)();
        (0, Welcome_1.setOnboardingPolicyID)();
        (0, navigateAfterOnboarding_1.default)(isSmallScreenWidth, isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), onboardingPolicyID, mergedAccountConciergeReportID);
    }, [
        onboardingPurposeSelected,
        currentUserPersonalDetails.firstName,
        currentUserPersonalDetails.lastName,
        onboardingAdminsChatReportID,
        onboardingMessages,
        onboardingPolicyID,
        isSmallScreenWidth,
        isBetaEnabled,
        mergedAccountConciergeReportID,
    ]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={BaseOnboardingWorkspaceOptional.displayName} style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default progressBarPercentage={100}/>
            <react_native_1.View style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.workspace.title')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.mb2}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.workspace.subtitle')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View>
                    {section.map(function (item) {
            return (<react_native_1.View key={item.titleTranslationKey} style={[styles.mt2, styles.mb3, styles.flexRow]}>
                                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                    <Icon_1.default src={item.icon} height={ICON_SIZE} width={ICON_SIZE} additionalStyles={[styles.mr3]}/>
                                    <react_native_1.View style={[styles.flexColumn, styles.flex1]}>
                                        <Text_1.default style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text_1.default>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </react_native_1.View>);
        })}
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pb5]}>
                <react_native_1.View style={[styles.flexRow, styles.renderHTML, styles.pb5]}>
                    <RenderHTML_1.default html={processedHelperText}/>
                </react_native_1.View>
                <react_native_1.View style={styles.mb2}>
                    <Button_1.default large text={translate('common.skip')} onPress={function () { return completeOnboarding(); }}/>
                </react_native_1.View>
                <react_native_1.View>
                    <Button_1.default success large text={translate('onboarding.workspace.createWorkspace')} onPress={function () {
            (0, Welcome_1.setOnboardingErrorMessage)('');
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACE_CONFIRMATION.getRoute());
        }}/>
                </react_native_1.View>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkspaceOptional.displayName = 'BaseOnboardingWorkspaceOptional';
exports.default = BaseOnboardingWorkspaceOptional;
