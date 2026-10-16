import Log from '@libs/Log';
import {getEmailDomain} from '@libs/LoginUtils';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {PUBLIC_DOMAINS_SET} from 'expensify-common';
import {useRef} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Returns a function that ends the Join Workspace onboarding flow from a step that has nothing further to show.
 *
 * The name step is the last step of this flow. When a name is already saved, onboarding completes with it exactly as
 * pressing Continue on the name step would; otherwise the name step opens to collect one.
 */
function useContinueJoinWorkspaceOnboarding() {
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {joinWorkspaceMessages} = useOnboardingMessages();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const isCompletingOnboarding = useRef(false);

    const workEmail = session?.email ?? '';
    const isValidated = isCurrentUserValidated(loginList, workEmail);
    const firstName = onboardingPersonalDetails?.firstName?.trim();
    const lastName = onboardingPersonalDetails?.lastName?.trim() ?? '';

    // After a public email is merged into a work email, onboarding ends in the work email's Concierge chat.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeReportID : undefined;

    const getJoinWorkspaceMessage = () => {
        if (onboardingPolicyID) {
            // A workspace that is already in Onyx was joined directly, so its join task is done and the message drops it.
            return onboardingPolicy ? {...joinWorkspaceMessages.joinWorkspace, tasks: []} : joinWorkspaceMessages.joinWorkspace;
        }
        if (PUBLIC_DOMAINS_SET.has(getEmailDomain(workEmail))) {
            return joinWorkspaceMessages.addWorkEmail;
        }
        if (!isValidated) {
            return joinWorkspaceMessages.validateEmail;
        }
        return joinWorkspaceMessages.empty;
    };

    const completeOnboardingWithSavedName = async (savedFirstName: string) => {
        if (isCompletingOnboarding.current) {
            return;
        }
        isCompletingOnboarding.current = true;

        try {
            await completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                onboardingMessage: getJoinWorkspaceMessage(),
                firstName: savedFirstName,
                lastName,
                adminsChatReportID: onboardingAdminsChatReportID,
                introSelected,
                isSelfTourViewed,
                conciergeChat,
                companyDomain: getEmailDomain(workEmail),
                workEmail,
                currentUserAccountID,
                delegateAccountID,
            });

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();

            navigateAfterOnboardingWithMicrotaskQueue(
                isSmallScreenWidth,
                isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                conciergeReportID,
                reportNameValuePairs,
                onboardingPolicy ? onboardingPolicyID : undefined,
                mergedAccountConciergeReportID,
                false,
            );
        } catch (error) {
            Log.warn('[useContinueJoinWorkspaceOnboarding] Error completing onboarding with the saved name', {error});
            isCompletingOnboarding.current = false;
        }
    };

    return (navigationOptions?: LinkToOptions) => {
        if (!firstName) {
            Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), navigationOptions);
            return;
        }
        completeOnboardingWithSavedName(firstName);
    };
}

export default useContinueJoinWorkspaceOnboarding;
