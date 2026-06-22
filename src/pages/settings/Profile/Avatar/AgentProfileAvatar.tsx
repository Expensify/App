import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {OnSaveParams} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {EditAgentAvatarContent} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {updateAvatar} from '@userActions/PersonalDetails';

function AgentProfileAvatar() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const handleAgentSave = (params: OnSaveParams) => {
        const previousAvatar = {
            avatar: currentUserPersonalDetails?.avatar,
            avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
            accountID: currentUserPersonalDetails?.accountID,
        };

        if ('file' in params) {
            updateAvatar(params.file, previousAvatar);
        } else {
            const {customExpensifyAvatarID} = params;
            const uri = AGENT_AVATARS.resolveURI(customExpensifyAvatarID);
            updateAvatar(
                {
                    uri,
                    name: customExpensifyAvatarID,
                    customExpensifyAvatarID,
                },
                previousAvatar,
            );
        }
        Navigation.dismissModal();
    };

    return (
        <EditAgentAvatarContent
            accountID={currentUserPersonalDetails.accountID}
            onSave={handleAgentSave}
        />
    );
}

export default AgentProfileAvatar;
