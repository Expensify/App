import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import isSidePanelReportSupported from '@components/SidePanel/isSidePanelReportSupported';
import Log from '@libs/Log';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding, extractRHPVariantFromResponse} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose, OnboardingRHPVariant, Policy} from '@src/types/onyx';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
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
        isSmallScreenWidth,
    } = useOnboardingWorkspaceCreationState();

    const paidGroupPolicySelector = useMemo(
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, currentUserEmail)),
        [currentUserEmail],
    );
    const [hasPaidGroupAdminPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: paidGroupPolicySelector});

    const [conciergeChatReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {isBetaEnabled} = usePermissions();

    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;

    const autoCreateTrackWorkspace = useCallback(
        async (firstName: string, lastName: string, onboardingPurposeSelected: OnboardingPurpose) => {
            const shouldCreateWorkspace = !isRestrictedPolicyCreation && !onboardingPolicyID && !hasPaidGroupAdminPolicy;
            const displayName = createDisplayName(currentUserEmail, {firstName, lastName}, formatPhoneNumber);

            const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: generateDefaultWorkspaceName(currentUserEmail, lastWorkspaceNumber, translate, displayName),
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
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
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            // On mobile, hardcode trackExpensesWithConcierge since the web flow already works
            // with the CompleteGuidedSetup response and side panel isn't supported on native.
            let rhpVariant: OnboardingRHPVariant | undefined = isSidePanelReportSupported ? undefined : CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE;
            try {
                const response = await completeOnboarding({
                    engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                    onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
                    firstName,
                    lastName,
                    adminsChatReportID: newAdminsChatReportID,
                    onboardingPolicyID: newPolicyID,
                    shouldWaitForRHPVariantInitialization: isSidePanelReportSupported,
                    introSelected,
                    isSelfTourViewed,
                    betas,
                });

                if (isSidePanelReportSupported) {
                    rhpVariant = extractRHPVariantFromResponse(response);
                }
            } catch (error) {
                Log.warn('[useAutoCreateTrackWorkspace] Error completing onboarding', {error});
            } finally {
                setOnboardingAdminsChatReportID();
                setOnboardingPolicyID();

                navigateAfterOnboardingWithMicrotaskQueue(
                    isSmallScreenWidth,
                    isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                    conciergeChatReportID,
                    archivedReportsIdSet,
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
            localCurrencyCode,
            introSelected,
            activePolicy,
            isSelfTourViewed,
            onboardingMessages,
            betas,
            hasActiveAdminPolicies,
            isSmallScreenWidth,
            isBetaEnabled,
            conciergeChatReportID,
            archivedReportsIdSet,
            mergedAccountConciergeReportID,
        ],
    );

    return autoCreateTrackWorkspace;
}

export default useAutoCreateTrackWorkspace;
