import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {AvatarCommonProps} from './types';

import AvatarBody from './AvatarBody';
import useWorkspaceAvatarSource from './useWorkspaceAvatarSource';

type WorkspaceAvatarProps = AvatarCommonProps & {
    /** Owner of the avatar. Policy name */
    name?: string;
};

/** Renders a workspace avatar, falling back to a default icon derived from the workspace name. */
function AvatarWorkspace({source, imageStyles, iconAdditionalStyles, containerStyles, size = CONST.AVATAR_SIZE.DEFAULT, fill, name = '', avatarID, testID = 'Avatar'}: WorkspaceAvatarProps) {
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

export default AvatarWorkspace;
