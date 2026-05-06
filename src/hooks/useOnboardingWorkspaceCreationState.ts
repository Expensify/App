import {hasSeenTourSelector} from '@selectors/Onboarding';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useActivePolicy from './useActivePolicy';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from './useHasActiveAdminPolicies';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import useLocalize from './useLocalize';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePreferredPolicy from './usePreferredPolicy';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Shared state for the onboarding workspace auto-creation hooks
 * (`useAutoCreateSubmitWorkspace`, `useAutoCreateTrackWorkspace`).
 *
 * Email and accountID come from `ONYXKEYS.SESSION` because session is hydrated
 * earlier in onboarding than personal details.
 */
function useOnboardingWorkspaceCreationState() {
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const currentUserEmail = session?.email ?? '';
    const currentUserAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const localCurrencyCode = currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD;

    const activePolicy = useActivePolicy();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const {onboardingMessages} = useOnboardingMessages();
    const lastWorkspaceNumber = useLastWorkspaceNumber();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return {
        onboardingPolicyID,
        onboardingAdminsChatReportID,
        introSelected,
        isSelfTourViewed,
        betas,
        currentUserPersonalDetails,
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
    };
}

export default useOnboardingWorkspaceCreationState;
