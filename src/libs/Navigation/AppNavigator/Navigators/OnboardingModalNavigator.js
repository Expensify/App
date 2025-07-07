"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stack_1 = require("@react-navigation/stack");
var react_1 = require("react");
var react_native_1 = require("react-native");
var NoDropZone_1 = require("@components/DragAndDrop/NoDropZone");
var FocusTrapForScreen_1 = require("@components/FocusTrap/FocusTrapForScreen");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var GoogleTagManager_1 = require("@libs/GoogleTagManager");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var OnboardingRefManager_1 = require("@libs/OnboardingRefManager");
var OnboardingAccounting_1 = require("@pages/OnboardingAccounting");
var OnboardingEmployees_1 = require("@pages/OnboardingEmployees");
var OnboardingPersonalDetails_1 = require("@pages/OnboardingPersonalDetails");
var OnboardingPrivateDomain_1 = require("@pages/OnboardingPrivateDomain");
var OnboardingPurpose_1 = require("@pages/OnboardingPurpose");
var OnboardingWorkEmail_1 = require("@pages/OnboardingWorkEmail");
var OnboardingWorkEmailValidation_1 = require("@pages/OnboardingWorkEmailValidation");
var OnboardingWorkspaceConfirmation_1 = require("@pages/OnboardingWorkspaceConfirmation");
var OnboardingWorkspaceCurrency_1 = require("@pages/OnboardingWorkspaceCurrency");
var OnboardingWorkspaceInvite_1 = require("@pages/OnboardingWorkspaceInvite");
var OnboardingWorkspaceOptional_1 = require("@pages/OnboardingWorkspaceOptional");
var OnboardingWorkspaces_1 = require("@pages/OnboardingWorkspaces");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var Overlay_1 = require("./Overlay");
var defaultScreenOptions = {
    headerShown: false,
    web: {
        cardStyleInterpolator: stack_1.CardStyleInterpolators.forHorizontalIOS,
        cardStyle: {
            height: '100%',
        },
    },
};
var Stack = (0, createPlatformStackNavigator_1.default)();
function OnboardingModalNavigator() {
    var styles = (0, useThemeStyles_1.default)();
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var outerViewRef = react_1.default.useRef(null);
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var isOnPrivateDomainAndHasAccessiblePolicies = !(account === null || account === void 0 ? void 0 : account.isFromPublicDomain) && (account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies);
    var initialRouteName = SCREENS_1.default.ONBOARDING.PURPOSE;
    if (isOnPrivateDomainAndHasAccessiblePolicies) {
        initialRouteName = SCREENS_1.default.ONBOARDING.PERSONAL_DETAILS;
    }
    if (account === null || account === void 0 ? void 0 : account.isFromPublicDomain) {
        initialRouteName = SCREENS_1.default.ONBOARDING.WORK_EMAIL;
    }
    if (onboardingPurposeSelected === CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND && !!onboardingPolicyID) {
        initialRouteName = SCREENS_1.default.ONBOARDING.WORKSPACE_INVITE;
    }
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, {
        selector: function (session) { var _a; return (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID; },
        canBeMissing: false,
    })[0];
    // Publish a sign_up event when we start the onboarding flow. This should track basic sign ups
    // as well as Google and Apple SSO.
    (0, react_1.useEffect)(function () {
        if (!accountID) {
            return;
        }
        GoogleTagManager_1.default.publishEvent(CONST_1.default.ANALYTICS.EVENT.SIGN_UP, accountID);
    }, [accountID]);
    var handleOuterClick = (0, react_1.useCallback)(function () {
        OnboardingRefManager_1.default.handleOuterClick();
    }, []);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE, handleOuterClick, { shouldBubble: true });
    // If the account data is not loaded yet, we don't want to show the onboarding modal
    if (isOnPrivateDomainAndHasAccessiblePolicies === undefined) {
        return null;
    }
    return (<NoDropZone_1.default>
            <Overlay_1.default />
            <react_native_1.View ref={outerViewRef} onClick={handleOuterClick} style={styles.onboardingNavigatorOuterView}>
                <FocusTrapForScreen_1.default>
                    <react_native_1.View onClick={function (e) { return e.stopPropagation(); }} style={styles.OnboardingNavigatorInnerView(onboardingIsMediumOrLargerScreenWidth)}>
                        <Stack.Navigator screenOptions={defaultScreenOptions} initialRouteName={initialRouteName}>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.PURPOSE} component={OnboardingPurpose_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.PERSONAL_DETAILS} component={OnboardingPersonalDetails_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORK_EMAIL} component={OnboardingWorkEmail_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORK_EMAIL_VALIDATION} component={OnboardingWorkEmailValidation_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.PRIVATE_DOMAIN} component={OnboardingPrivateDomain_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORKSPACES} component={OnboardingWorkspaces_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.EMPLOYEES} component={OnboardingEmployees_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.ACCOUNTING} component={OnboardingAccounting_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORKSPACE_OPTIONAL} component={OnboardingWorkspaceOptional_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORKSPACE_CONFIRMATION} component={OnboardingWorkspaceConfirmation_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORKSPACE_CURRENCY} component={OnboardingWorkspaceCurrency_1.default}/>
                            <Stack.Screen name={SCREENS_1.default.ONBOARDING.WORKSPACE_INVITE} component={OnboardingWorkspaceInvite_1.default}/>
                        </Stack.Navigator>
                    </react_native_1.View>
                </FocusTrapForScreen_1.default>
            </react_native_1.View>
        </NoDropZone_1.default>);
}
OnboardingModalNavigator.displayName = 'OnboardingModalNavigator';
exports.default = OnboardingModalNavigator;
