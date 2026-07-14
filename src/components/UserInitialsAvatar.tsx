import useStyleUtils from '@hooks/useStyleUtils';

import type {LetterAvatarColorStyle} from '@libs/Avatars/letterAvatarPalette';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import Text from './Text';

/** Puts Neue Bold's cap height (0.7em) at 27% of the avatar diameter, matching the generated letter-avatar images. */
const INITIALS_FONT_SIZE_RATIO = 0.27 / 0.7;

const styles = StyleSheet.create({
    circle: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    text: {
        includeFontPadding: false,
    },
});

type UserInitialsAvatarProps = {
    /** The initials to render */
    text: string;

    /** Background and fill colors for the avatar */
    colors: LetterAvatarColorStyle;

    /** Pixel diameter of the avatar */
    size: number;
};

function UserInitialsAvatar({text, colors, size}: UserInitialsAvatarProps) {
    const StyleUtils = useStyleUtils();
    return (
        <View style={[styles.circle, StyleUtils.getWidthAndHeightStyle(size, size), StyleUtils.getBorderRadiusStyle(size / 2), StyleUtils.getBackgroundColorStyle(colors.backgroundColor)]}>
            <Text
                family="EXP_NEUE_BOLD"
                color={colors.fillColor}
                fontSize={Math.round(size * INITIALS_FONT_SIZE_RATIO)}
                textAlign="center"
                style={styles.text}
            >
                {text}
            </Text>
        </View>
    );
}

export default UserInitialsAvatar;
export type {UserInitialsAvatarProps};
