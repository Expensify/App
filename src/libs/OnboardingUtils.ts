import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {JoinablePolicies, OnboardingPurpose} from '@src/types/onyx';

/**
 * Returns true when the onboarding choice is one of the "track" variants
 * (TRACK_BUSINESS/TRACK_WORKSPACE, TRACK_PERSONAL, or the legacy PERSONAL_SPEND).
 * Note: TRACK_BUSINESS and TRACK_WORKSPACE share the same value ('newDotTrackWorkspace'),
 * so checking TRACK_BUSINESS covers both.
 * Extracted here so that adding a new track-type choice only requires one edit.
 */
function isTrackOnboardingChoice(choice: OnyxEntry<OnboardingPurpose>): choice is OnboardingPurpose {
    return choice === CONST.ONBOARDING_CHOICES.TRACK_BUSINESS || choice === CONST.ONBOARDING_CHOICES.TRACK_PERSONAL || choice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND;
}

/**
 * Counts the joinable policies that are actually surfaced during onboarding. SUBMIT-type policies are hidden
 * unless the SUBMIT_2026 beta is enabled, mirroring the filter the Workspaces and PrivateDomain screens use to
 * render/skip. Centralizing it keeps the step counter and EMPLOYEES back button in sync with what the user sees,
 * so a user whose only joinable policies are hidden SUBMIT policies never gets a phantom WORKSPACES step.
 */
function getVisibleJoinablePoliciesCount(joinablePolicies: OnyxEntry<JoinablePolicies>, canUseSubmit2026: boolean): number {
    return Object.values(joinablePolicies ?? {}).filter((policy) => policy.policyType !== CONST.POLICY.TYPE.SUBMIT || canUseSubmit2026).length;
}

export {isTrackOnboardingChoice, getVisibleJoinablePoliciesCount};
export default isTrackOnboardingChoice;
