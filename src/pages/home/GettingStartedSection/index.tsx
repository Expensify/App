import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import DefaultGettingStartedSection from './DefaultGettingStartedSection';
import InviteeGettingStartedSection from './InviteeGettingStartedSection';

function GettingStartedSection() {
    // Only users who signed up from a workspace invite mount the invitee list, so other users don't subscribe to the data it needs.
    const [isWorkspaceInvitee = false] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {
        selector: (introSelected) => introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected?.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE,
    });

    if (isWorkspaceInvitee) {
        return <InviteeGettingStartedSection />;
    }

    return <DefaultGettingStartedSection />;
}

export default GettingStartedSection;
