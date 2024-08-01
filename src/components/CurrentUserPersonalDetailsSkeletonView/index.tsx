import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type CurrentUserPersonalDetailsSkeletonViewProps = {
    /** Whether to animate the skeleton view */
    shouldAnimate?: boolean;

    /** The size of the avatar */
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function CurrentUserPersonalDetailsSkeletonView({shouldAnimate = true, avatarSize = CONST.AVATAR_SIZE.LARGE}: CurrentUserPersonalDetailsSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(avatarSize);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const spaceBetweenAvatarAndHeadline = styles.mb3.marginBottom + styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const headlineSize = variables.fontSizeXLarge;
    const spaceBetweenHeadlineAndLabel = styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const labelSize = variables.fontSizeLabel;
    return (
        <View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                height={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline + headlineSize + spaceBetweenHeadlineAndLabel + labelSize}
            >
                <Circle
                    cx="50%"
                    cy={avatarPlaceholderRadius}
                    r={avatarPlaceholderRadius}
                />
                <Rect
                    x="20%"
                    y={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline}
                    width="60%"
                    height={headlineSize}
                />
                <Rect
                    x="15%"
                    y={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline + headlineSize + spaceBetweenHeadlineAndLabel}
                    width="70%"
                    height={labelSize}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

CurrentUserPersonalDetailsSkeletonView.displayName = 'CurrentUserPersonalDetailsSkeletonView';
export default CurrentUserPersonalDetailsSkeletonView;
