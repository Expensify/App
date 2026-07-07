import useTheme from '@hooks/useTheme';

import type {AvatarSizeName} from '@styles/utils';

import type {AvatarType} from '@src/types/onyx/OnyxCommon';

import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {ResolvedAvatar} from './types';

import AvatarIcon from './AvatarIcon';
import AvatarImage from './AvatarImage';
import AvatarInitials from './AvatarInitials';

type AvatarBodyProps = {
    /** The resolved avatar model that selects which branch to render. */
    resolvedAvatar: ResolvedAvatar;

    /** Set the size of Avatar */
    size: AvatarSizeName;

    /** Denotes avatar type (currently user avatar vs workspace avatar) */
    type: AvatarType;

    /** The fill color for the icon */
    fill?: string;

    /** Styles to pass */
    imageStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Extra styles to pass to Icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;
};

/** Renders a resolved avatar as a remote image, an SVG icon, or locally drawn initials. */
function AvatarBody({resolvedAvatar, size, type, imageStyles, iconAdditionalStyles, fill}: AvatarBodyProps) {
    const theme = useTheme();
    if (resolvedAvatar.variant === 'initials') {
        return (
            <AvatarInitials
                initials={resolvedAvatar.initials}
                colors={resolvedAvatar.colors}
                size={size}
                type={type}
                initialsContainerStyles={imageStyles}
                initialsAdditionalStyles={iconAdditionalStyles}
            />
        );
    }

    if (resolvedAvatar.variant === 'image') {
        return (
            <AvatarImage
                avatarSource={resolvedAvatar.avatarSource}
                size={size}
                type={type}
                imageStyles={imageStyles}
                imageContainerAdditionalStyles={iconAdditionalStyles}
                onImageError={resolvedAvatar.onImageError}
            />
        );
    }

    return (
        <AvatarIcon
            avatarSource={resolvedAvatar.avatarSource}
            size={size}
            type={type}
            iconContainerStyles={imageStyles}
            iconAdditionalStyles={iconAdditionalStyles}
            fallbackAvatarTestID={resolvedAvatar.fallbackAvatarTestID}
            iconColors={resolvedAvatar.iconColors}
            fill={resolvedAvatar.iconColors?.fill ?? (resolvedAvatar.hasImageError ? theme.offline : fill)}
        />
    );
}

export default AvatarBody;
