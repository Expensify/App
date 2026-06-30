import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useState} from 'react';
import isSidePanelReportSupported from '@components/SidePanel/isSidePanelReportSupported';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@libs/actions/Policy/Policy';
import {completeOnboarding, extractRHPVariantFromResponse} from '@libs/actions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@libs/actions/Welcome';
import type {OnboardingFeatureMapItem} from '@libs/actions/Welcome/OnboardingFeatures';
import Log from '@libs/Log';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {isGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {OnboardingAccounting} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useActivePolicy from './useActivePolicy';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from './useHasActiveAdminPolicies';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

type CompleteOnboardingParams = {
    featuresMap: OnboardingFeatureMapItem[];
    userReportedIntegration?: OnboardingAccounting;
};

function useCompleteOnboarding() {
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {onboardingMessages} = useOnboardingMessages();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const activePolicy = useActivePolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const lastWorkspaceNumber = useLastWorkspaceNumber();

    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [adminsChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onboardingAdminsChatReportID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [isLoading, setIsLoading] = useState(false);

    const groupPolicy = Object.values(allPolicies ?? {}).find((policy) => isGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));

    const completeOnboardingFlow = async ({featuresMap, userReportedIntegration}: CompleteOnboardingParams) => {
        if (!onboardingPurposeSelected || !onboardingCompanySize) {
            return;
        }

        try {
            setIsLoading(true);

            const shouldCreateWorkspace = !onboardingPolicyID && !groupPolicy;
            const isAccountingEnabled = featuresMap.some((feature) => feature.id === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED && feature.enabled);
            const resolvedIntegration = isAccountingEnabled ? userReportedIntegration : undefined;
            const email = currentUserPersonalDetails.email ?? '';

            const {adminsChatReportID, policyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: generateDefaultWorkspaceName(email, lastWorkspaceNumber, translate),
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                      currency: currentUserPersonalDetails?.localCurrencyCode ?? '',
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      companySize: onboardingCompanySize,
                      userReportedIntegration: resolvedIntegration,
                      featuresMap,
                      introSelected,
                      activePolicy,
                      currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                      currentUserEmailParam: email,
                      shouldAddGuideWelcomeMessage: false,
                      betas,
                      isSelfTourViewed,
                      hasActiveAdminPolicies,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            if (shouldCreateWorkspace) {
                setOnboardingAdminsChatReportID(adminsChatReportID);
                setOnboardingPolicyID(policyID);
            }

            const response = await completeOnboarding({
                engagementChoice: onboardingPurposeSelected,
                onboardingMessage: onboardingMessages[onboardingPurposeSelected],
                adminsChatReportID,
                onboardingPolicyID: policyID,
                companySize: onboardingCompanySize,
                userReportedIntegration: resolvedIntegration,
                firstName: currentUserPersonalDetails?.firstName,
                lastName: currentUserPersonalDetails?.lastName,
                selectedInterestedFeatures: featuresMap.filter((feature) => feature.enabled).map((feature) => feature.id),
                shouldWaitForRHPVariantInitialization: isSidePanelReportSupported,
                introSelected,
                isSelfTourViewed,
                conciergeChat,
                adminsChatReport,
            });
            const rhpVariant = isSidePanelReportSupported ? extractRHPVariantFromResponse(response) : undefined;

            navigateAfterOnboardingWithMicrotaskQueue(
                isSmallScreenWidth,
                isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                conciergeReportID,
                reportNameValuePairs,
                policyID,
                adminsChatReportID,
                (session?.email ?? '').includes('+'),
                {
                    variantOverride: rhpVariant,
                    afterTransition: () => {
                        setOnboardingAdminsChatReportID();
                        setOnboardingPolicyID();
                    },
                },
            );
        } catch (error) {
            Log.warn('[useCompleteOnboarding] Error completing onboarding', {error});
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
    };

    return {completeOnboardingFlow, isLoading};
}

export default useCompleteOnboarding;
