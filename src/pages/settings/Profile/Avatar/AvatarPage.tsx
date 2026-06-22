import React from 'react';
import {useIsAgentAccount} from '@libs/SessionUtils';
import AgentProfileAvatar from './AgentProfileAvatar';
import UserProfileAvatar from './UserProfileAvatar';

function ProfileAvatar() {
    const isAgentAccount = useIsAgentAccount();

    if (isAgentAccount) {
        return <AgentProfileAvatar />;
    }

    return <UserProfileAvatar />;
}

export default ProfileAvatar;
