import Log from '@libs/Log';
import {getEmailDomain} from '@libs/LoginUtils';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';
import {getJoinWorkspaceMessage} from '@libs/OnboardingUtils';
import {isCurrentUserValidated} from '@libs/UserUtils';

import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DisplayNameForm} from '@src/types/form/DisplayNameForm';
import type {IntroSelected, LoginList, Onboarding, Report, ReportNameValuePairs, Session} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useRef} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingMessages from './useOnboardingMessages';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useResponsiveLayout from './useResponsiveLayout';

type UseContinueJoinWorkspaceOnboardingParams = {
    session: OnyxEntry<Session>;
    loginList: OnyxEntry<LoginList>;
    onboardingValues: OnyxEntry<Onboarding>;
    onboardingPersonalDetails: OnyxEntry<DisplayNameForm>;
    introSelected: OnyxEntry<IntroSelected>;
    conciergeReportID: OnyxEntry<string>;
    conciergeChat: OnyxEntry<Report>;
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    delegateAccountID: number | undefined;
};

/**
 * Returns a function that ends the Join Workspace onboarding flow from a step that has nothing further to show.
 *
 * Callers own the shared Onyx subscriptions; this hook only reads the policy and admins chat used by completion.
 *
 * The name step is the last step of this flow. When a name is already saved, onboarding completes with it exactly as
 * pressing Continue on the name step would; otherwise the name step opens to collect one.
 */
function useContinueJoinWorkspaceOnboarding({
    session,
    loginList,
    onboardingValues,
    onboardingPersonalDetails,
    introSelected,
    conciergeReportID,
    conciergeChat,
    reportNameValuePairs,
    delegateAccountID,
}: UseContinueJoinWorkspaceOnboardingParams) {
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {joinWorkspaceMessages} = useOnboardingMessages();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const isCompletingOnboarding = useRef(false);
    const isSelfTourViewed = hasSeenTourSelector(onboardingValues);

    const workEmail = session?.email ?? '';
    const isAnonymousUser = session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    const isValidated = isCurrentUserValidated(loginList, workEmail);
    const firstName = onboardingPersonalDetails?.firstName?.trim();
    const lastName = onboardingPersonalDetails?.lastName?.trim() ?? '';

    // After a public email is merged into a work email, onboarding ends in the work email's Concierge chat.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeReportID : undefined;

    const completeOnboardingWithSavedName = async (savedFirstName: string) => {
        if (isCompletingOnboarding.current) {
            return;
        }
        isCompletingOnboarding.current = true;

        try {
            await completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                onboardingMessage: getJoinWorkspaceMessage({joinWorkspaceMessages, onboardingPolicyID, onboardingPolicy, workEmail, isValidated}),
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
                isAnonymousUser,
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
