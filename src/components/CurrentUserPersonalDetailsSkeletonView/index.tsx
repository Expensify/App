import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const x = 30;

    return (
        <View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                height={avatarPlaceholderSize + styles.pb5.paddingBottom}
            >
                <Circle
                    cx={x}
                    cy={avatarPlaceholderRadius}
                    r={avatarPlaceholderRadius}
                />
                <Rect
                    x={x + avatarPlaceholderRadius + styles.gap3.gap}
                    y="11"
                    width="45%"
                    height="8"
                />
                <Rect
                    x={x + avatarPlaceholderRadius + styles.gap3.gap}
                    y="31"
                    width="55%"
                    height="8"
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

CurrentUserPersonalDetailsSkeletonView.displayName = 'CurrentUserPersonalDetailsSkeletonView';
export default CurrentUserPersonalDetailsSkeletonView;
