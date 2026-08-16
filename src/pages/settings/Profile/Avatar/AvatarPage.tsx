import useIsAgentAccount from '@hooks/useIsAgentAccount';

import React from 'react';

import AgentProfileAvatar from './AgentProfileAvatar';
import UserProfileAvatar from './UserProfileAvatar';

function ProfileAvatar() {
    const isAgentAccount = useIsAgentAccount();

    if (isAgentAccount === undefined) {
        return null;
    }

    if (isAgentAccount) {
        return <AgentProfileAvatar />;
    }

    return <UserProfileAvatar />;
}

export default ProfileAvatar;
