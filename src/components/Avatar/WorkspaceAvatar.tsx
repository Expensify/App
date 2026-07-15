import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {AvatarCommonProps} from './types';

import useWorkspaceAvatarSource from './hooks/useWorkspaceAvatarSource';
import AvatarBody from './primitives/AvatarBody';

type WorkspaceAvatarProps = AvatarCommonProps & {
    /** Workspace name. Seeds the default workspace avatar (icon + test ID) used when `source` is missing. */
    name: string;

    /** Workspace/policy ID. Picks the background color of the default workspace avatar. */
    avatarID: number | string;
};

/** Renders a workspace avatar, falling back to a default icon derived from the workspace name. */
function WorkspaceAvatar({source, imageStyles, iconAdditionalStyles, containerStyles, size = CONST.AVATAR_SIZE.DEFAULT, fill, name, avatarID, testID = 'Avatar'}: WorkspaceAvatarProps) {
    const styles = useThemeStyles();
    const resolvedAvatar = useWorkspaceAvatarSource({source, name, avatarID});

    return (
        <View
            style={[containerStyles, styles.pointerEventsNone]}
            testID={testID}
        >
            <AvatarBody
                resolvedAvatar={resolvedAvatar}
                size={size}
                type={CONST.ICON_TYPE_WORKSPACE}
                fill={fill}
                imageStyles={imageStyles}
                iconAdditionalStyles={iconAdditionalStyles}
            />
        </View>
    );
}

export default WorkspaceAvatar;
