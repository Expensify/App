import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';

type AccountSwitcherSkeletonViewProps = {
    /** Whether to animate the skeleton view */
    shouldAnimate?: boolean;

    /** The size of the avatar */
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
};

function AccountSwitcherSkeletonView({shouldAnimate = true, avatarSize = CONST.AVATAR_SIZE.DEFAULT}: AccountSwitcherSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    useSkeletonSpan('AccountSwitcherSkeletonView');
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(avatarSize);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const startPositionX = avatarPlaceholderRadius;
    const rectXTranslation = startPositionX + avatarPlaceholderRadius + styles.gap3.gap;

    return (
        <View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader
                animate={shouldAnimate}
                backgroundColor={theme.skeletonLHNIn}
                foregroundColor={theme.skeletonLHNOut}
                height={avatarPlaceholderSize}
            >
                <Circle
                    cx={startPositionX}
                    cy={avatarPlaceholderRadius}
                    r={avatarPlaceholderRadius}
                />
                <Rect
                    transform={[{translateX: rectXTranslation}, {translateY: 6}]}
                    width="45%"
                    height="8"
                />
                <Rect
                    transform={[{translateX: rectXTranslation}, {translateY: 26}]}
                    width="55%"
                    height="8"
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

AccountSwitcherSkeletonView.displayName = 'AccountSwitcherSkeletonView';
export default AccountSwitcherSkeletonView;
