import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {AvatarCommonProps} from './types';

import AvatarBody from './AvatarBody';
import AvatarInitials from './AvatarInitials';
import useUserAvatarSource from './useUserAvatarSource';

type UserAvatarProps = AvatarCommonProps & {
    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Used to locate fallback icon in end-to-end tests. */
    fallbackIconTestID?: string;
};

/** Renders a user avatar, falling back to a default icon when no source is available. */
function UserAvatar({
    source,
    imageStyles,
    iconAdditionalStyles,
    containerStyles,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fill,
    fallbackIcon,
    fallbackIconTestID = '',
    avatarID,
    testID = 'Avatar',
}: UserAvatarProps) {
    const styles = useThemeStyles();
    const resolvedAvatar = useUserAvatarSource({source, avatarID, fallbackIcon, fallbackIconTestID});

    return (
        <View
            style={[containerStyles, styles.pointerEventsNone]}
            testID={testID}
        >
            {resolvedAvatar.variant === 'initials' ? (
                <AvatarInitials
                    initials={resolvedAvatar.initials}
                    colors={resolvedAvatar.colors}
                    size={size}
                    type={CONST.ICON_TYPE_AVATAR}
                    initialsContainerStyles={imageStyles}
                    initialsAdditionalStyles={iconAdditionalStyles}
                />
            ) : (
                <AvatarBody
                    resolvedAvatar={resolvedAvatar}
                    size={size}
                    type={CONST.ICON_TYPE_AVATAR}
                    fill={fill}
                    imageStyles={imageStyles}
                    iconAdditionalStyles={iconAdditionalStyles}
                />
            )}
        </View>
    );
}

export default UserAvatar;
