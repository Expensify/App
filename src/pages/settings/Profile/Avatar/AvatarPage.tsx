import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import {useIsAgentAccount} from '@libs/SessionUtils';
import type {OnSaveParams} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {EditAgentAvatarContent} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import {updateAvatar} from '@userActions/PersonalDetails';
import EditUserAvatarContent from './EditUserAvatarContent';

function ProfileAgentAvatar() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const handleAgentSave = (params: OnSaveParams) => {
        if ('file' in params) {
            updateAvatar(params.file, {
                avatar: currentUserPersonalDetails?.avatar,
                avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                accountID: currentUserPersonalDetails?.accountID,
            });
        } else {
            const {customExpensifyAvatarID} = params;
            const uri = AGENT_AVATARS.resolveURI(customExpensifyAvatarID);
            updateAvatar(
                {
                    uri,
                    name: customExpensifyAvatarID,
                    customExpensifyAvatarID,
                },
                {
                    avatar: currentUserPersonalDetails?.avatar,
                    avatarThumbnail: currentUserPersonalDetails?.avatarThumbnail,
                    accountID: currentUserPersonalDetails?.accountID,
                },
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

function ProfileAvatar() {
    const isAgentAccount = useIsAgentAccount();

    return isAgentAccount ? <ProfileAgentAvatar /> : <EditUserAvatarContent />;
}

export default ProfileAvatar;
