"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var OnboardingFlow_1 = require("@libs/actions/Welcome/OnboardingFlow");
var Navigation_1 = require("@libs/Navigation/Navigation");
var onboardingSelectors_1 = require("@libs/onboardingSelectors");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var TooltipUtils_1 = require("@libs/TooltipUtils");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var useOnyx_1 = require("./useOnyx");
/**
 * Hook to handle redirection to the onboarding flow based on the user's onboarding status
 *
 * Warning: This hook should be used only once in the app
 */
function useOnboardingFlowRouter() {
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, {
        canBeMissing: true,
    }), onboardingValues = _a[0], isOnboardingCompletedMetadata = _a[1];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var startedOnboardingFlowRef = (0, react_1.useRef)(false);
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, {
        selector: onboardingSelectors_1.tryNewDotOnyxSelector,
        canBeMissing: true,
    }), tryNewDot = _b[0], tryNewDotMetadata = _b[1];
    var _c = tryNewDot !== null && tryNewDot !== void 0 ? tryNewDot : {}, isHybridAppOnboardingCompleted = _c.isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration = _c.hasBeenAddedToNudgeMigration;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, { canBeMissing: true }), dismissedProductTraining = _d[0], dismissedProductTrainingMetadata = _d[1];
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SINGLE_NEW_DOT_ENTRY, { canBeMissing: true }), isSingleNewDotEntry = _e[0], isSingleNewDotEntryMetadata = _e[1];
    (0, react_1.useEffect)(function () {
        // This should delay opening the onboarding modal so it does not interfere with the ongoing ReportScreen params changes
        react_native_1.InteractionManager.runAfterInteractions(function () {
            if (isLoadingApp !== false) {
                return;
            }
            if ((0, isLoadingOnyxValue_1.default)(isOnboardingCompletedMetadata, tryNewDotMetadata, dismissedProductTrainingMetadata)) {
                return;
            }
            if (CONFIG_1.default.IS_HYBRID_APP && (0, isLoadingOnyxValue_1.default)(isSingleNewDotEntryMetadata)) {
                return;
            }
            if (hasBeenAddedToNudgeMigration && !(0, TooltipUtils_1.default)('migratedUserWelcomeModal', dismissedProductTraining)) {
                var defaultCannedQuery = (0, SearchQueryUtils_1.buildCannedSearchQuery)();
                var query = defaultCannedQuery;
                Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: query }));
                Navigation_1.default.navigate(ROUTES_1.default.MIGRATED_USER_WELCOME_MODAL.getRoute(true));
                return;
            }
            if (hasBeenAddedToNudgeMigration) {
                return;
            }
            var isOnboardingCompleted = (0, onboardingSelectors_1.hasCompletedGuidedSetupFlowSelector)(onboardingValues);
            if (CONFIG_1.default.IS_HYBRID_APP) {
                // For single entries, such as using the Travel feature from OldDot, we don't want to show onboarding
                if (isSingleNewDotEntry) {
                    return;
                }
                // When user is transitioning from OldDot to NewDot, we usually show the explanation modal
                if (isHybridAppOnboardingCompleted === false) {
                    Navigation_1.default.navigate(ROUTES_1.default.EXPLANATION_MODAL_ROOT);
                }
                // But if the hybrid app onboarding is completed, but NewDot onboarding is not completed, we start NewDot onboarding flow
                // This is a special case when user created an account from NewDot without finishing the onboarding flow and then logged in from OldDot
                if (isHybridAppOnboardingCompleted === true && isOnboardingCompleted === false && !startedOnboardingFlowRef.current) {
                    startedOnboardingFlowRef.current = true;
                    (0, OnboardingFlow_1.startOnboardingFlow)({
                        onboardingValuesParam: onboardingValues,
                        isUserFromPublicDomain: !!(account === null || account === void 0 ? void 0 : account.isFromPublicDomain),
                        hasAccessiblePolicies: !!(account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies),
                    });
                }
            }
            // If the user is not transitioning from OldDot to NewDot, we should start NewDot onboarding flow if it's not completed yet
            if (!CONFIG_1.default.IS_HYBRID_APP && isOnboardingCompleted === false && !startedOnboardingFlowRef.current) {
                startedOnboardingFlowRef.current = true;
                (0, OnboardingFlow_1.startOnboardingFlow)({
                    onboardingValuesParam: onboardingValues,
                    isUserFromPublicDomain: !!(account === null || account === void 0 ? void 0 : account.isFromPublicDomain),
                    hasAccessiblePolicies: !!(account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies),
                });
            }
        });
    }, [
        isLoadingApp,
        isHybridAppOnboardingCompleted,
        isOnboardingCompletedMetadata,
        tryNewDotMetadata,
        isSingleNewDotEntryMetadata,
        isSingleNewDotEntry,
        hasBeenAddedToNudgeMigration,
        dismissedProductTrainingMetadata,
        dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining.migratedUserWelcomeModal,
        onboardingValues,
        dismissedProductTraining,
        account === null || account === void 0 ? void 0 : account.isFromPublicDomain,
        account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies,
    ]);
    return { isOnboardingCompleted: (0, onboardingSelectors_1.hasCompletedGuidedSetupFlowSelector)(onboardingValues), isHybridAppOnboardingCompleted: isHybridAppOnboardingCompleted };
}
exports.default = useOnboardingFlowRouter;
