import Log from '@libs/Log';
import {navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {canEditWorkspaceSettings, isGroupPolicy, isSubmitPolicy} from '@libs/PolicyUtils';

import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback, useMemo} from 'react';

import useOnboardingWorkspaceCreationState from './useOnboardingWorkspaceCreationState';
import useOnyx from './useOnyx';

/**
 * Hook that provides a function to auto-create a Submit workspace for EMPLOYER
 * users during onboarding and complete the onboarding flow.
 *
 * Shared by BaseOnboardingPersonalDetails, BaseOnboardingPurpose, and BaseOnboardingWorkspaces.
 */
function useAutoCreateSubmitWorkspace() {
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

    const groupPolicySelector = useMemo(
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isGroupPolicy(policy) && canEditWorkspaceSettings(policy)),
        [],
    );
    const [hasEditableGroupPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPolicySelector});
    const existingSubmitPolicyIDSelector = useMemo(
        // Pass the login so the per-employee role fallback in canEditWorkspaceSettings covers
        // partially-loaded policies where the top-level `role` isn't populated yet.
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).find((policy) => isSubmitPolicy(policy) && canEditWorkspaceSettings(policy, currentUserEmail))?.id,
        [currentUserEmail],
    );
    const [existingSubmitPolicyID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: existingSubmitPolicyIDSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const autoCreateSubmitWorkspace = useCallback(
        // Callers that already finished onboarding (e.g. the Submit plan welcome modal) don't need to
        // run guided setup again, so they can skip the CompleteGuidedSetup request by passing `false`.
        async (firstName: string, lastName: string, shouldCompleteOnboarding = true) => {
            const shouldCreateWorkspace = !isRestrictedPolicyCreation && !onboardingPolicyID && !hasEditableGroupPolicy;
            const displayName = createDisplayName(currentUserEmail, {firstName, lastName}, formatPhoneNumber);

            const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: generateDefaultWorkspaceName(currentUserEmail, lastWorkspaceNumber, translate, displayName),
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                      currency: localCurrencyCode,
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      introSelected,
                      activePolicy,
                      conciergeChat,
                      currentUserAccountIDParam: currentUserAccountID,
                      currentUserEmailParam: currentUserEmail,
                      shouldAddGuideWelcomeMessage: false,
                      type: CONST.POLICY.TYPE.SUBMIT,
                      betas,
                      isSelfTourViewed,
                      hasActiveAdminPolicies,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            if (shouldCompleteOnboarding) {
                try {
                    await completeOnboarding({
                        engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                        onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.EMPLOYER],
                        firstName,
                        lastName,
                        adminsChatReportID: newAdminsChatReportID,
                        onboardingPolicyID: newPolicyID,
                        introSelected,
                        isSelfTourViewed,
                        conciergeChat,
                    });
                } catch (error) {
                    // Swallow onboarding completion failures so a network error doesn't block workspace
                    // creation or the follow-up navigation; the optimistic Onyx data is already applied.
                    // Still log so the failure remains diagnosable.
                    Log.warn('[useAutoCreateSubmitWorkspace] Error completing onboarding', {error});
                }
            }

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();

            // Already-onboarded callers (the Submit plan welcome modal) can reach this point with no workspace
            // created and no onboarding policy ID when an editable Submit workspace already exists. Navigate to
            // that existing workspace instead of falling back to Home. Onboarding callers keep the current
            // behavior since they complete onboarding with `newPolicyID` and should land accordingly.
            let policyIDForNavigation = newPolicyID;
            if (!policyIDForNavigation && !shouldCompleteOnboarding) {
                policyIDForNavigation = existingSubmitPolicyID;
            }

            navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(policyIDForNavigation, shouldUseNarrowLayout);
        },
        [
            currentUserEmail,
            currentUserAccountID,
            lastWorkspaceNumber,
            translate,
            formatPhoneNumber,
            isRestrictedPolicyCreation,
            onboardingPolicyID,
            hasEditableGroupPolicy,
            existingSubmitPolicyID,
            onboardingAdminsChatReportID,
            localCurrencyCode,
            introSelected,
            activePolicy,
            isSelfTourViewed,
            onboardingMessages,
            betas,
            hasActiveAdminPolicies,
            shouldUseNarrowLayout,
            conciergeChat,
        ],
    );

    return autoCreateSubmitWorkspace;
}

export default useAutoCreateSubmitWorkspace;
