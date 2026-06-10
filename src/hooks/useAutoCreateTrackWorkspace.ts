import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import isSidePanelReportSupported from '@components/SidePanel/isSidePanelReportSupported';
import Log from '@libs/Log';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import isTrackOnboardingChoice from '@libs/OnboardingUtils';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding, extractRHPVariantFromResponse} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose, OnboardingRHPVariant, Policy} from '@src/types/onyx';
import useArchivedReportsIDSet from './useArchivedReportsIDSet';
import useOnboardingWorkspaceCreationState from './useOnboardingWorkspaceCreationState';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Hook that provides a function to auto-create a workspace for Track (PERSONAL_SPEND)
 * users during onboarding and complete the onboarding flow.
 *
 * Shared by BaseOnboardingPersonalDetails and BaseOnboardingPurpose.
 */
function useAutoCreateTrackWorkspace() {
    const {
        onboardingPolicyID,
        onboardingAdminsChatReportID,
        introSelected,
        isSelfTourViewed,
        betas,
        currentUserEmail,
        currentUserAccountID,
        localCurrencyCode,
        activePolicy,
        translate,
        formatPhoneNumber,
        isRestrictedPolicyCreation,
        hasActiveAdminPolicies,
        onboardingMessages,
        lastWorkspaceNumber,
        shouldUseNarrowLayout,
    } = useOnboardingWorkspaceCreationState();
    const [onboardingPersonalTrackGoal] = useOnyx(ONYXKEYS.ONBOARDING_PERSONAL_TRACK_GOAL);

    const paidGroupPolicySelector = useMemo(
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, currentUserEmail)),
        [currentUserEmail],
    );
    const [hasPaidGroupAdminPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: paidGroupPolicySelector});

    const [conciergeChatReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const archivedReportsIDSet = useArchivedReportsIDSet();
    const {isBetaEnabled} = usePermissions();

    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;

    const autoCreateTrackWorkspace = useCallback(
        async (firstName: string, lastName: string, onboardingPurposeSelected: OnboardingPurpose, personalTrackGoalOverride?: string) => {
            const shouldCreateWorkspace = !isRestrictedPolicyCreation && !onboardingPolicyID && !hasPaidGroupAdminPolicy;
            const displayName = createDisplayName(currentUserEmail, {firstName, lastName}, formatPhoneNumber);
            // Callers that set the goal in the same tick must pass it explicitly, because the Onyx value read above is still stale here.
            const personalTrackGoal = personalTrackGoalOverride ?? onboardingPersonalTrackGoal;

            const engagementChoice =
                onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.TRACK_PERSONAL ? CONST.ONBOARDING_CHOICES.TRACK_PERSONAL : CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE;

            const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: generateDefaultWorkspaceName(currentUserEmail, lastWorkspaceNumber, translate, displayName),
                      policyID: generatePolicyID(),
                      engagementChoice,
                      currency: localCurrencyCode,
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      introSelected,
                      activePolicy,
                      currentUserAccountIDParam: currentUserAccountID,
                      currentUserEmailParam: currentUserEmail,
                      shouldAddGuideWelcomeMessage: false,
                      onboardingPurposeSelected,
                      betas,
                      isSelfTourViewed,
                      hasActiveAdminPolicies,
                      personalTrackGoal: onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.TRACK_PERSONAL && !!personalTrackGoal ? personalTrackGoal : undefined,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            // On mobile, hardcode trackExpensesWithConcierge since the web flow already works
            // with the CompleteGuidedSetup response and side panel isn't supported on native.
            let rhpVariant: OnboardingRHPVariant | undefined = isSidePanelReportSupported ? undefined : CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE;
            try {
                const response = await completeOnboarding({
                    engagementChoice,
                    onboardingMessage: onboardingMessages[engagementChoice],
                    firstName,
                    lastName,
                    adminsChatReportID: newAdminsChatReportID,
                    onboardingPolicyID: newPolicyID,
                    shouldWaitForRHPVariantInitialization: isSidePanelReportSupported,
                    personalTrackGoal: onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.TRACK_PERSONAL && !!personalTrackGoal ? personalTrackGoal : undefined,
                    introSelected,
                    isSelfTourViewed,
                });

                if (isSidePanelReportSupported) {
                    rhpVariant = extractRHPVariantFromResponse(response);
                    // Every Track onboarding choice should land in the Concierge RHP, but the backend
                    // doesn't reliably return trackExpensesWithConcierge for all of them, so fall back to it
                    // whenever the response omits a variant.
                    if (!rhpVariant && isTrackOnboardingChoice(onboardingPurposeSelected)) {
                        rhpVariant = CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE;
                    }
                }
            } catch (error) {
                Log.warn('[useAutoCreateTrackWorkspace] Error completing onboarding', {error});
            } finally {
                setOnboardingAdminsChatReportID();
                setOnboardingPolicyID();

                navigateAfterOnboardingWithMicrotaskQueue(
                    shouldUseNarrowLayout,
                    isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                    conciergeChatReportID,
                    archivedReportsIDSet,
                    newPolicyID,
                    mergedAccountConciergeReportID,
                    false,
                    rhpVariant,
                );
            }
        },
        [
            currentUserEmail,
            currentUserAccountID,
            lastWorkspaceNumber,
            translate,
            formatPhoneNumber,
            isRestrictedPolicyCreation,
            onboardingPolicyID,
            hasPaidGroupAdminPolicy,
            onboardingAdminsChatReportID,
            onboardingPersonalTrackGoal,
            localCurrencyCode,
            introSelected,
            activePolicy,
            isSelfTourViewed,
            onboardingMessages,
            betas,
            hasActiveAdminPolicies,
            shouldUseNarrowLayout,
            isBetaEnabled,
            conciergeChatReportID,
            archivedReportsIDSet,
            mergedAccountConciergeReportID,
        ],
    );

    return autoCreateTrackWorkspace;
}

export default useAutoCreateTrackWorkspace;
