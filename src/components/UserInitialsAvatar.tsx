import React from 'react';
import {View} from 'react-native';
import type {LetterAvatarColorStyle} from '@libs/Avatars/letterAvatarPalette';
import Text from './Text';

type UserInitialsAvatarProps = {
    /** The initials to render */
    text: string;

    /** Background and fill colors for the avatar */
    colors: LetterAvatarColorStyle;

    /** Pixel diameter of the avatar */
    size: number;
};

function UserInitialsAvatar({text, colors, size}: UserInitialsAvatarProps) {
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            <Text
                family="EXP_NEUE_BOLD"
                color={colors.fillColor}
                fontSize={Math.round(size * 0.28)}
                textAlign="center"
                style={{includeFontPadding: false}}
            >
                {text}
            </Text>
        </View>
    );
}

export default UserInitialsAvatar;
export type {UserInitialsAvatarProps};
