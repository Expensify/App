import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {canEditWorkspaceSettings, isGroupPolicy} from '@libs/PolicyUtils';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
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
        isSmallScreenWidth,
    } = useOnboardingWorkspaceCreationState();

    const groupPolicySelector = useMemo(
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isGroupPolicy(policy) && canEditWorkspaceSettings(policy)),
        [],
    );
    const [hasEditableGroupPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPolicySelector});

    const autoCreateSubmitWorkspace = useCallback(
        (firstName: string, lastName: string) => {
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
                      currentUserAccountIDParam: currentUserAccountID,
                      currentUserEmailParam: currentUserEmail,
                      shouldAddGuideWelcomeMessage: false,
                      type: CONST.POLICY.TYPE.SUBMIT,
                      betas,
                      isSelfTourViewed,
                      hasActiveAdminPolicies,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.EMPLOYER],
                firstName,
                lastName,
                adminsChatReportID: newAdminsChatReportID,
                onboardingPolicyID: newPolicyID,
                introSelected,
                isSelfTourViewed,
                betas,
            });

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();

            navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(newPolicyID, isSmallScreenWidth);
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
            onboardingAdminsChatReportID,
            localCurrencyCode,
            introSelected,
            activePolicy,
            isSelfTourViewed,
            onboardingMessages,
            betas,
            hasActiveAdminPolicies,
            isSmallScreenWidth,
        ],
    );

    return autoCreateSubmitWorkspace;
}

export default useAutoCreateSubmitWorkspace;
