import Avatar from '@components/Avatar';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React, {useCallback} from 'react';

import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useThemeStyles from './useThemeStyles';

function useWorkspaceConfirmationAvatar({policyID, source, name}: {policyID: string | undefined; source: AvatarSource; name: string}) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const styles = useThemeStyles();

    return useCallback(
        () => (
            <Avatar
                containerStyles={styles.avatarXxxxxLarge}
                imageStyles={[styles.avatarXxxxxLarge, styles.alignSelfCenter]}
                source={source}
                fallbackIcon={icons.FallbackWorkspaceAvatar}
                size={CONST.AVATAR_SIZE.XXXXX_LARGE}
                name={name}
                avatarID={policyID}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
        ),
        [name, policyID, source, styles.alignSelfCenter, styles.avatarXxxxxLarge, icons.FallbackWorkspaceAvatar],
    );
}

export default useWorkspaceConfirmationAvatar;
