import React, {useCallback} from 'react';
import Avatar from '@components/Avatar';
import * as Expensicons from '@components/Icon/Expensicons';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import useThemeStyles from './useThemeStyles';

function useWorkspaceConfirmationAvatar({policyID, source, name}: {policyID: string | undefined; source: AvatarSource; name: string}) {
    const styles = useThemeStyles();

    return useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXLarge}
                imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                source={source}
                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.X_LARGE}
                name={name}
                avatarID={policyID}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [name, policyID, source, styles.alignSelfCenter, styles.avatarXLarge],
    );
}

export default useWorkspaceConfirmationAvatar;
