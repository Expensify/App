import React from 'react';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';
import AvatarUser from './AvatarUser';
import AvatarWorkspace from './AvatarWorkspace';
import type {AvatarCommonProps} from './types';

type AvatarProps = AvatarCommonProps & {
    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Used to locate fallback icon in end-to-end tests. */
    fallbackIconTestID?: string;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name?: string;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;
};

/** Renders a user or workspace avatar depending on the `type` prop. */
function Avatar({type, name, fallbackIcon, fallbackIconTestID, source, imageStyles, iconAdditionalStyles, containerStyles, size, fill, testID, avatarID}: AvatarProps) {
    if (type === CONST.ICON_TYPE_WORKSPACE) {
        return (
            <AvatarWorkspace
                name={name}
                source={source}
                imageStyles={imageStyles}
                iconAdditionalStyles={iconAdditionalStyles}
                containerStyles={containerStyles}
                size={size}
                fill={fill}
                testID={testID}
                avatarID={avatarID}
            />
        );
    }

    return (
        <AvatarUser
            fallbackIcon={fallbackIcon}
            fallbackIconTestID={fallbackIconTestID}
            source={source}
            imageStyles={imageStyles}
            iconAdditionalStyles={iconAdditionalStyles}
            containerStyles={containerStyles}
            size={size}
            fill={fill}
            testID={testID}
            avatarID={avatarID}
        />
    );
}

export default Avatar;

export type {AvatarProps};
