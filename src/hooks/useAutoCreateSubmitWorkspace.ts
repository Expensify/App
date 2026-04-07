import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {createWorkspace, generatePolicyID, newGenerateDefaultWorkspaceName} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from './useHasActiveAdminPolicies';
import useLocalize from './useLocalize';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePreferredPolicy from './usePreferredPolicy';

/**
 * Hook that provides a function to auto-create a Submit workspace for EMPLOYER
 * users during onboarding and complete the onboarding flow.
 *
 * After creating the workspace, navigates to Workspace > Categories with the
 * side panel open so #admins is visible in Concierge Anywhere.
 *
 * Shared by BaseOnboardingPersonalDetails, BaseOnboardingPurpose, and BaseOnboardingWorkspaces.
 */
function useAutoCreateSubmitWorkspace() {
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const paidGroupPolicySelector = useMemo(
        () => (policies: OnyxCollection<Policy>) => Object.values(policies ?? {}).some((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email)),
        [session?.email],
    );
    const lastWorkspaceNumberWithEmailSelector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            return lastWorkspaceNumberSelector(policies, session?.email ?? '');
        },
        [session?.email],
    );
    const [hasPaidGroupAdminPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: paidGroupPolicySelector});
    const [lastWorkspaceNumber] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastWorkspaceNumberWithEmailSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const {onboardingMessages} = useOnboardingMessages();

    const autoCreateSubmitWorkspace = useCallback(
        (firstName: string, lastName: string) => {
            const shouldCreateWorkspace = !isRestrictedPolicyCreation && !onboardingPolicyID && !hasPaidGroupAdminPolicy;
            const displayName = createDisplayName(session?.email ?? '', {firstName, lastName}, formatPhoneNumber);

            const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: newGenerateDefaultWorkspaceName(session?.email ?? '', lastWorkspaceNumber, translate, displayName),
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                      currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      introSelected,
                      activePolicyID,
                      currentUserAccountIDParam: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                      currentUserEmailParam: session?.email ?? '',
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

            navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(newPolicyID);
        },
        [
            session?.email,
            session?.accountID,
            lastWorkspaceNumber,
            translate,
            formatPhoneNumber,
            isRestrictedPolicyCreation,
            onboardingPolicyID,
            hasPaidGroupAdminPolicy,
            onboardingAdminsChatReportID,
            currentUserPersonalDetails.localCurrencyCode,
            introSelected,
            activePolicyID,
            isSelfTourViewed,
            onboardingMessages,
            betas,
            hasActiveAdminPolicies,
        ],
    );

    return autoCreateSubmitWorkspace;
}

export default useAutoCreateSubmitWorkspace;
