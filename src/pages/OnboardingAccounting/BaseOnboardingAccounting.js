"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CustomStatusBarAndBackgroundContext_1 = require("@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var FixedFooter_1 = require("@components/FixedFooter");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var RadioButtonWithLabel_1 = require("@components/RadioButtonWithLabel");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Report_1 = require("@libs/actions/Report");
var Welcome_1 = require("@libs/actions/Welcome");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var OnboardingUtils_1 = require("@libs/OnboardingUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var variables_1 = require("@styles/variables");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var integrations = [
    {
        key: 'quickbooksOnline',
        icon: Expensicons.QBOCircle,
        translationKey: 'workspace.accounting.qbo',
    },
    {
        key: 'quickbooksDesktop',
        icon: Expensicons.QBDSquare,
        translationKey: 'workspace.accounting.qbd',
    },
    {
        key: 'xero',
        icon: Expensicons.XeroCircle,
        translationKey: 'workspace.accounting.xero',
    },
    {
        key: 'netsuite',
        icon: Expensicons.NetSuiteSquare,
        translationKey: 'workspace.accounting.netsuite',
    },
    {
        key: 'intacct',
        icon: Expensicons.IntacctSquare,
        translationKey: 'workspace.accounting.intacct',
    },
    {
        key: 'sap',
        icon: Expensicons.SapSquare,
        translationKey: 'workspace.accounting.sap',
    },
    {
        key: 'oracle',
        icon: Expensicons.OracleSquare,
        translationKey: 'workspace.accounting.oracle',
    },
    {
        key: 'microsoftDynamics',
        icon: Expensicons.MicrosoftDynamicsSquare,
        translationKey: 'workspace.accounting.microsoftDynamics',
    },
];
function BaseOnboardingAccounting(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), onboardingIsMediumOrLargerScreenWidth = _b.onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth = _b.isSmallScreenWidth;
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var onboardingCompanySize = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_COMPANY_SIZE, { canBeMissing: true })[0];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var _c = (0, react_1.useState)(undefined), userReportedIntegration = _c[0], setUserReportedIntegration = _c[1];
    var _d = (0, react_1.useState)(''), error = _d[0], setError = _d[1];
    var paidGroupPolicy = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).find(function (policy) { return (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && (0, PolicyUtils_1.isPolicyAdmin)(policy, session === null || session === void 0 ? void 0 : session.email); });
    var onboarding = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isLoading = onboarding === null || onboarding === void 0 ? void 0 : onboarding.isLoading;
    var prevIsLoading = (0, usePrevious_1.default)(isLoading);
    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    (0, react_1.useEffect)(function () {
        var _a;
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        (0, Welcome_1.setOnboardingAdminsChatReportID)((_a = paidGroupPolicy.chatReportIDAdmins) === null || _a === void 0 ? void 0 : _a.toString());
        (0, Welcome_1.setOnboardingPolicyID)(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);
    (0, react_1.useEffect)(function () {
        if (!!isLoading || !prevIsLoading) {
            return;
        }
        if (CONFIG_1.default.IS_HYBRID_APP) {
            react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: true });
            setRootStatusBarEnabled(false);
            return;
        }
        (0, SequentialQueue_1.waitForIdle)().then(function () {
            (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX, true);
        });
    }, [isLoading, prevIsLoading, setRootStatusBarEnabled]);
    var accountingOptions = (0, react_1.useMemo)(function () {
        var createAccountingOption = function (integration) { return ({
            keyForList: integration.key,
            text: translate(integration.translationKey),
            leftElement: (<Icon_1.default src={integration.icon} width={variables_1.default.iconSizeExtraLarge} height={variables_1.default.iconSizeExtraLarge} additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST_1.default.AVATAR_SIZE.DEFAULT, CONST_1.default.ICON_TYPE_AVATAR), styles.mr3]}/>),
            isSelected: userReportedIntegration === integration.key,
        }); };
        var noneAccountingOption = {
            keyForList: null,
            text: translate('onboarding.accounting.none'),
            leftElement: (<Icon_1.default src={Expensicons.CircleSlash} width={variables_1.default.iconSizeNormal} height={variables_1.default.iconSizeNormal} fill={theme.icon} additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST_1.default.AVATAR_SIZE.DEFAULT, CONST_1.default.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}/>),
            isSelected: userReportedIntegration === null,
        };
        var othersAccountingOption = {
            keyForList: 'other',
            text: translate('workspace.accounting.other'),
            leftElement: (<Icon_1.default src={Expensicons.Connect} width={variables_1.default.iconSizeNormal} height={variables_1.default.iconSizeNormal} fill={theme.icon} additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST_1.default.AVATAR_SIZE.DEFAULT, CONST_1.default.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}/>),
            isSelected: userReportedIntegration === 'other',
        };
        return __spreadArray(__spreadArray([], integrations.map(createAccountingOption), true), [othersAccountingOption, noneAccountingOption], false);
    }, [StyleUtils, styles.mr3, styles.onboardingSmallIcon, theme.icon, translate, userReportedIntegration]);
    var handleContinue = (0, react_1.useCallback)(function () {
        if (userReportedIntegration === undefined) {
            setError(translate('onboarding.errorSelection'));
            return;
        }
        if (!onboardingPurposeSelected || !onboardingCompanySize) {
            return;
        }
        var shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;
        // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
        // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
        var _a = shouldCreateWorkspace
            ? (0, Policy_1.createWorkspace)(undefined, true, '', (0, Policy_1.generatePolicyID)(), CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, '', undefined, false, onboardingCompanySize)
            : { adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID }, adminsChatReportID = _a.adminsChatReportID, policyID = _a.policyID;
        if (shouldCreateWorkspace) {
            (0, Welcome_1.setOnboardingAdminsChatReportID)(adminsChatReportID);
            (0, Welcome_1.setOnboardingPolicyID)(policyID);
        }
        (0, Report_1.completeOnboarding)({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: onboardingMessages[onboardingPurposeSelected],
            adminsChatReportID: adminsChatReportID,
            onboardingPolicyID: policyID,
            companySize: onboardingCompanySize,
            userReportedIntegration: userReportedIntegration,
        });
        if ((0, OnboardingUtils_1.shouldOnboardingRedirectToOldDot)(onboardingCompanySize, userReportedIntegration)) {
            if (CONFIG_1.default.IS_HYBRID_APP) {
                return;
            }
            (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX, true);
        }
        // Avoid creating new WS because onboardingPolicyID is cleared before unmounting
        react_native_1.InteractionManager.runAfterInteractions(function () {
            (0, Welcome_1.setOnboardingAdminsChatReportID)();
            (0, Welcome_1.setOnboardingPolicyID)();
        });
        // We need to wait the policy is created before navigating out the onboarding flow
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            var _a;
            (0, navigateAfterOnboarding_1.default)(isSmallScreenWidth, isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), policyID, adminsChatReportID, 
            // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
            // See https://github.com/Expensify/App/issues/57167 for more details
            ((_a = session === null || session === void 0 ? void 0 : session.email) !== null && _a !== void 0 ? _a : '').includes('+'));
        });
    }, [
        isBetaEnabled,
        isSmallScreenWidth,
        onboardingAdminsChatReportID,
        onboardingCompanySize,
        onboardingMessages,
        onboardingPolicyID,
        onboardingPurposeSelected,
        paidGroupPolicy,
        session === null || session === void 0 ? void 0 : session.email,
        translate,
        userReportedIntegration,
    ]);
    var handleIntegrationSelect = (0, react_1.useCallback)(function (integrationKey) {
        setUserReportedIntegration(integrationKey);
        setError('');
    }, []);
    var renderOption = (0, react_1.useCallback)(function (item) {
        var _a;
        return (<Pressable_1.PressableWithoutFeedback key={(_a = item.keyForList) !== null && _a !== void 0 ? _a : ''} onPress={function () { return handleIntegrationSelect(item.keyForList); }} accessibilityLabel={item.text} accessible={false} hoverStyle={!item.isSelected ? styles.hoveredComponentBG : undefined} style={[styles.onboardingAccountingItem, isSmallScreenWidth && styles.flexBasis100, item.isSelected && styles.activeComponentBG]}>
                <RadioButtonWithLabel_1.default isChecked={!!item.isSelected} onPress={function () { return handleIntegrationSelect(item.keyForList); }} style={[styles.flexRowReverse]} wrapperStyle={[styles.ml0]} labelElement={<react_native_1.View style={[styles.alignItemsCenter, styles.flexRow]}>
                            {item.leftElement}
                            <Text_1.default style={styles.textStrong}>{item.text}</Text_1.default>
                        </react_native_1.View>} shouldBlendOpacity/>
            </Pressable_1.PressableWithoutFeedback>);
    }, [
        handleIntegrationSelect,
        isSmallScreenWidth,
        styles.alignItemsCenter,
        styles.flexBasis100,
        styles.flexRow,
        styles.flexRowReverse,
        styles.ml0,
        styles.onboardingAccountingItem,
        styles.textStrong,
        styles.hoveredComponentBG,
        styles.activeComponentBG,
    ]);
    return (<ScreenWrapper_1.default testID="BaseOnboardingAccounting" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default shouldShowBackButton progressBarPercentage={80} onBackButtonPress={Navigation_1.default.goBack}/>
            <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text_1.default style={[styles.textHeadlineH1, styles.mb5]}>{translate('onboarding.accounting.title')}</Text_1.default>
            </react_native_1.View>
            <ScrollView_1.default style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pt3, styles.pb8]}>
                <react_native_1.View style={[styles.flexRow, styles.flexWrap, styles.gap3, styles.mb3]}>{accountingOptions.map(renderOption)}</react_native_1.View>
            </ScrollView_1.default>
            <FixedFooter_1.default style={[styles.pt3, styles.ph5]}>
                {!!error && (<FormHelpMessage_1.default style={[styles.ph1, styles.mb2]} isError message={error}/>)}

                <Button_1.default success large text={translate('common.continue')} onPress={handleContinue} isLoading={isLoading} isDisabled={isOffline && (0, OnboardingUtils_1.shouldOnboardingRedirectToOldDot)(onboardingCompanySize, userReportedIntegration)} pressOnEnter/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';
exports.default = BaseOnboardingAccounting;
