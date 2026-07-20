import {useIsAgentAccount} from '@libs/SessionUtils';

import React from 'react';

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
