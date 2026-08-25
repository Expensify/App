import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';

type AccountSwitcherSkeletonViewProps = {
    shouldAnimate?: boolean;

    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;

    width?: number;

    /** Additional styles for the skeleton view */
    style?: StyleProp<ViewStyle>;
};

function AccountSwitcherSkeletonView({shouldAnimate = true, avatarSize = CONST.AVATAR_SIZE.DEFAULT, width, style}: AccountSwitcherSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(avatarSize);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const startPositionX = avatarPlaceholderRadius;
    const rectXTranslation = startPositionX + avatarPlaceholderRadius + styles.gap3.gap;

    return (
        <View style={[width ? undefined : styles.avatarSectionWrapperSkeleton, style]}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                width={width}
                height={avatarPlaceholderSize}
            >
                <Circle
                    cx={startPositionX}
                    cy={avatarPlaceholderRadius}
                    r={avatarPlaceholderRadius}
                />
                <SkeletonRect
                    transform={[{translateX: rectXTranslation}, {translateY: 6}]}
                    width="45%"
                    height="8"
                />
                <SkeletonRect
                    transform={[{translateX: rectXTranslation}, {translateY: 26}]}
                    width="55%"
                    height="8"
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

export default AccountSwitcherSkeletonView;
