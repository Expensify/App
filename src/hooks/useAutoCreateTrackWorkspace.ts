import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useCallback} from 'react';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {createWorkspace, generatePolicyID} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose} from '@src/types/onyx';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePreferredPolicy from './usePreferredPolicy';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Hook that provides a function to auto-create a workspace for Track (PERSONAL_SPEND)
 * users during onboarding and complete the onboarding flow.
 *
 * Shared by BaseOnboardingPersonalDetails and BaseOnboardingPurpose.
 */
function useAutoCreateTrackWorkspace() {
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [conciergeChatReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {isBetaEnabled} = usePermissions();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const {onboardingMessages} = useOnboardingMessages();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;

    const autoCreateTrackWorkspace = useCallback(
        (firstName: string, lastName: string, onboardingPurposeSelected: OnboardingPurpose) => {
            const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
            const shouldCreateWorkspace = !isRestrictedPolicyCreation && !onboardingPolicyID && !paidGroupPolicy;

            const {adminsChatReportID: newAdminsChatReportID, policyID: newPolicyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: `${firstName}'s Workspace`,
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                      currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      introSelected,
                      activePolicyID,
                      currentUserAccountIDParam: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                      currentUserEmailParam: session?.email ?? '',
                      shouldAddGuideWelcomeMessage: false,
                      onboardingPurposeSelected,
                      betas,
                      isSelfTourViewed,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
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

            navigateAfterOnboardingWithMicrotaskQueue(
                isSmallScreenWidth,
                isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                conciergeChatReportID,
                archivedReportsIdSet,
                newPolicyID,
                mergedAccountConciergeReportID,
                false,
            );
        },
        [
            allPolicies,
            session?.email,
            session?.accountID,
            isRestrictedPolicyCreation,
            onboardingPolicyID,
            onboardingAdminsChatReportID,
            currentUserPersonalDetails.localCurrencyCode,
            introSelected,
            activePolicyID,
            isSelfTourViewed,
            onboardingMessages,
            betas,
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
