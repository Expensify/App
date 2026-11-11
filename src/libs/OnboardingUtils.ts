import CONST from '@src/CONST';
import type {OnboardingInvite} from '@src/CONST';
import type {IntroSelected, OnboardingPurpose, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {PUBLIC_DOMAINS_SET} from 'expensify-common';

import type {getOnboardingMessages, OnboardingMessage} from './actions/Welcome/OnboardingFlow';

import {getEmailDomain} from './LoginUtils';

type GetJoinWorkspaceMessageParams = {
    joinWorkspaceMessages: ReturnType<typeof getOnboardingMessages>['joinWorkspaceMessages'];
    onboardingPolicyID: OnyxEntry<string>;
    onboardingPolicy: OnyxEntry<Policy>;
    workEmail: string;
    isValidated: boolean;
};

type SupportedInviteOnboardingChoice = typeof CONST.ONBOARDING_CHOICES.ADMIN | typeof CONST.ONBOARDING_CHOICES.SUBMIT | typeof CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
type SupportedPendingInviteIntroSelected = IntroSelected & {
    choice: SupportedInviteOnboardingChoice;
    inviteType: Exclude<OnboardingInvite, typeof CONST.ONBOARDING_INVITE_TYPES.IOU | typeof CONST.ONBOARDING_INVITE_TYPES.INVOICE>;
};

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

function isSupportedInviteOnboardingChoice(choice: OnyxEntry<OnboardingPurpose>): choice is SupportedInviteOnboardingChoice {
    return choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
}

function isSupportedPendingInviteOnboarding(introSelected: OnyxEntry<IntroSelected>): introSelected is SupportedPendingInviteIntroSelected {
    if (!introSelected) {
        return false;
    }

    if (!introSelected.inviteType || introSelected.isInviteOnboardingComplete) {
        return false;
    }

    const isInviteIOUorInvoice = introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;

    return isSupportedInviteOnboardingChoice(introSelected.choice) && !isInviteIOUorInvoice;
}

/** Selects the Join Workspace completion message for both saved-name and personal-details onboarding. */
function getJoinWorkspaceMessage({joinWorkspaceMessages, onboardingPolicyID, onboardingPolicy, workEmail, isValidated}: GetJoinWorkspaceMessageParams): OnboardingMessage {
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
}

export {getJoinWorkspaceMessage, isSupportedInviteOnboardingChoice, isSupportedPendingInviteOnboarding, isTrackOnboardingChoice};
