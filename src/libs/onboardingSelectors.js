"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCompletedGuidedSetupFlowSelector = hasCompletedGuidedSetupFlowSelector;
exports.tryNewDotOnyxSelector = tryNewDotOnyxSelector;
exports.hasSeenTourSelector = hasSeenTourSelector;
exports.wasInvitedToNewDotSelector = wasInvitedToNewDotSelector;
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
/**
 * Selector to get the value of hasCompletedGuidedSetupFlow from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the NewDot onboarding flow
 * `false` means the user has not completed the NewDot onboarding flow
 */
function hasCompletedGuidedSetupFlowSelector(onboarding) {
    // Onboarding is an empty object for old accounts and accounts migrated from OldDot
    if ((0, EmptyObject_1.isEmptyObject)(onboarding)) {
        return true;
    }
    if (!(0, EmptyObject_1.isEmptyObject)(onboarding) && (onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow) === undefined) {
        return true;
    }
    return onboarding === null || onboarding === void 0 ? void 0 : onboarding.hasCompletedGuidedSetupFlow;
}
/**
 * Selector to get the value of completedHybridAppOnboarding from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the hybrid app onboarding flow
 * `false` means the user has not completed the hybrid app onboarding flow
 */
function tryNewDotOnyxSelector(tryNewDotData) {
    var _a, _b;
    var isHybridAppOnboardingCompleted = (_a = tryNewDotData === null || tryNewDotData === void 0 ? void 0 : tryNewDotData.classicRedirect) === null || _a === void 0 ? void 0 : _a.completedHybridAppOnboarding;
    var hasBeenAddedToNudgeMigration = !!((_b = tryNewDotData === null || tryNewDotData === void 0 ? void 0 : tryNewDotData.nudgeMigration) === null || _b === void 0 ? void 0 : _b.timestamp);
    // Backend might return strings instead of booleans
    if (typeof isHybridAppOnboardingCompleted === 'string') {
        isHybridAppOnboardingCompleted = isHybridAppOnboardingCompleted === 'true';
    }
    return { isHybridAppOnboardingCompleted: isHybridAppOnboardingCompleted, hasBeenAddedToNudgeMigration: hasBeenAddedToNudgeMigration };
}
/**
 * Selector to get the value of selfTourViewed from the Onyx store
 *
 * `undefined` means the value is not loaded yet
 * `true` means the user has completed the NewDot onboarding flow
 * `false` means the user has not completed the NewDot onboarding flow
 */
function hasSeenTourSelector(onboarding) {
    if ((0, EmptyObject_1.isEmptyObject)(onboarding)) {
        return false;
    }
    return !!(onboarding === null || onboarding === void 0 ? void 0 : onboarding.selfTourViewed);
}
/**
 * Selector to get the value of nvp_introSelected NVP from the Onyx Store
 *
 * `undefined` means the value is not loaded yet
 * `true` means they were invited to NewDot
 * `false` means they are an organic sign-in
 */
function wasInvitedToNewDotSelector(introSelected) {
    return (introSelected === null || introSelected === void 0 ? void 0 : introSelected.inviteType) !== undefined;
}
