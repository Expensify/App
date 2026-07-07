import UserInitialsAvatar from '@components/UserInitialsAvatar';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {LetterAvatarColorStyle} from '@libs/Avatars/letterAvatarPalette';

import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {AvatarBranchCommonProps} from './types';

type AvatarInitialsProps = AvatarBranchCommonProps & {
    /** The initials to render. */
    initials: string;

    /** Background and fill colors for the initials avatar. */
    colors: LetterAvatarColorStyle;

    /** Styles for View wrapping the initials. */
    initialsContainerStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles for the wrapping View. */
    initialsAdditionalStyles?: StyleProp<ViewStyle>;
};

/** Renders an avatar as locally drawn user initials, replacing the backend-generated letter-avatar image. */
function AvatarInitials({initials, colors, size, type, initialsContainerStyles, initialsAdditionalStyles}: AvatarInitialsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    const containerStyles = initialsContainerStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, initialsContainerStyles] : undefined;

    return (
        <View style={[containerStyles, StyleUtils.getAvatarBorderStyle(size, type), initialsAdditionalStyles]}>
            <UserInitialsAvatar
                text={initials}
                colors={colors}
                size={avatarSize}
            />
        </View>
    );
}

export default AvatarInitials;
