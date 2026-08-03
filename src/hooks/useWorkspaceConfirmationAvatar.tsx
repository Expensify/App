import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React from 'react';

function useWorkspaceConfirmationAvatar({policyID, source, name}: {policyID: string | undefined; source?: AvatarSource; name: string}) {
    return (
        <WorkspaceAvatar
            source={source}
            size={CONST.AVATAR_SIZE.XXXX_LARGE}
            name={name}
            avatarID={policyID ?? CONST.DEFAULT_NUMBER_ID}
        />
    );
}

export default useWorkspaceConfirmationAvatar;
