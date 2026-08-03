import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React from 'react';

import useThemeStyles from './useThemeStyles';

function useWorkspaceConfirmationAvatar({policyID, source, name}: {policyID: string | undefined; source?: AvatarSource; name: string}) {
    const styles = useThemeStyles();

    return (
        <WorkspaceAvatar
            containerStyles={styles.avatarXLarge}
            imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
            source={source}
            size={CONST.AVATAR_SIZE.XXXX_LARGE}
            name={name}
            avatarID={policyID ?? CONST.DEFAULT_NUMBER_ID}
        />
    );
}

export default useWorkspaceConfirmationAvatar;
