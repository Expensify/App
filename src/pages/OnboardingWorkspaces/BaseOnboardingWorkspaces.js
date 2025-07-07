"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var Member_1 = require("@userActions/Policy/Member");
var Policy_1 = require("@userActions/Policy/Policy");
var Report_1 = require("@userActions/Report");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseOnboardingWorkspaces(_a) {
    var route = _a.route, shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), onboardingIsMediumOrLargerScreenWidth = _b.onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth = _b.isSmallScreenWidth;
    var joinablePolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.JOINABLE_POLICIES, { canBeMissing: true })[0];
    var getAccessiblePoliciesAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, { canBeMissing: true })[0];
    var joinablePoliciesLoading = getAccessiblePoliciesAction === null || getAccessiblePoliciesAction === void 0 ? void 0 : getAccessiblePoliciesAction.loading;
    var joinablePoliciesLength = Object.keys(joinablePolicies !== null && joinablePolicies !== void 0 ? joinablePolicies : {}).length;
    var onboardingPersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var isValidated = (0, UserUtils_1.isCurrentUserValidated)(loginList);
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var handleJoinWorkspace = (0, react_1.useCallback)(function (policy) {
        var _a, _b;
        if (policy.automaticJoiningEnabled) {
            (0, Member_1.joinAccessiblePolicy)(policy.policyID);
        }
        else {
            (0, Member_1.askToJoinPolicy)(policy.policyID);
        }
        (0, Report_1.completeOnboarding)({
            engagementChoice: CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND,
            onboardingMessage: onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND],
            firstName: (_a = onboardingPersonalDetails === null || onboardingPersonalDetails === void 0 ? void 0 : onboardingPersonalDetails.firstName) !== null && _a !== void 0 ? _a : '',
            lastName: (_b = onboardingPersonalDetails === null || onboardingPersonalDetails === void 0 ? void 0 : onboardingPersonalDetails.lastName) !== null && _b !== void 0 ? _b : '',
        });
        (0, Welcome_1.setOnboardingAdminsChatReportID)();
        (0, Welcome_1.setOnboardingPolicyID)(policy.policyID);
        (0, navigateAfterOnboarding_1.default)(isSmallScreenWidth, isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), policy.automaticJoiningEnabled ? policy.policyID : undefined);
    }, [onboardingMessages, onboardingPersonalDetails === null || onboardingPersonalDetails === void 0 ? void 0 : onboardingPersonalDetails.firstName, onboardingPersonalDetails === null || onboardingPersonalDetails === void 0 ? void 0 : onboardingPersonalDetails.lastName, isSmallScreenWidth, isBetaEnabled]);
    var policyIDItems = (0, react_1.useMemo)(function () {
        return Object.values(joinablePolicies !== null && joinablePolicies !== void 0 ? joinablePolicies : {}).map(function (policyInfo) {
            return {
                text: policyInfo.policyName,
                alternateText: translate('onboarding.workspaceMemberList', { employeeCount: policyInfo.employeeCount, policyOwner: policyInfo.policyOwner }),
                keyForList: policyInfo.policyID,
                isDisabled: true,
                rightElement: (<Button_1.default isDisabled={isOffline} success medium text={policyInfo.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')} onPress={function () {
                        handleJoinWorkspace(policyInfo);
                    }}/>),
                icons: [
                    {
                        id: policyInfo.policyID,
                        source: (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policyInfo.policyName),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policyInfo.policyName,
                        type: CONST_1.default.ICON_TYPE_WORKSPACE,
                    },
                ],
            };
        });
    }, [translate, isOffline, joinablePolicies, handleJoinWorkspace]);
    var wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (!isValidated || joinablePoliciesLength > 0 || joinablePoliciesLoading) {
            return;
        }
        (0, Policy_1.getAccessiblePolicies)();
    }, [isValidated, joinablePoliciesLength, joinablePoliciesLoading]));
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack();
    }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID="BaseOnboardingWorkspaces" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]} shouldShowOfflineIndicator={isSmallScreenWidth}>
            <HeaderWithBackButton_1.default shouldShowBackButton progressBarPercentage={60} onBackButtonPress={handleBackButtonPress}/>
            <SelectionList_1.default sections={[{ data: policyIDItems }]} onSelectRow={function () { }} ListItem={UserListItem_1.default} listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : []} showLoadingPlaceholder={joinablePoliciesLoading} shouldStopPropagation showScrollIndicator headerContent={<react_native_1.View style={[wrapperPadding, onboardingIsMediumOrLargerScreenWidth && styles.mt5, styles.mb5]}>
                        <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text_1.default>
                        <Text_1.default style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.listOfWorkspaces')}</Text_1.default>
                    </react_native_1.View>} footerContent={<Button_1.default success={false} large text={translate('common.skip')} onPress={function () {
                var _a;
                Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo));
            }} style={[styles.mt5]}/>}/>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkspaces.displayName = 'BaseOnboardingWorkspaces';
exports.default = BaseOnboardingWorkspaces;
