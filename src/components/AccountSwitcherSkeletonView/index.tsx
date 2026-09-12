import SkeletonRect from '@components/SkeletonRect';
import SkeletonViewContentLoader from '@components/SkeletonViewContentLoader';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';
import {Circle} from 'react-native-svg';

const BAR_HEIGHT = 8;
const NAME_BAR_WIDTH_RATIO = 0.45;
const LOGIN_BAR_WIDTH_RATIO = 0.55;
const SWITCH_BUTTON_WIDTH = 96;

type AccountSwitcherSkeletonViewProps = {
    shouldAnimate?: boolean;
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
    width?: number;

    /** Whether to stack the bars under a centered avatar, mirroring the narrow-layout account header */
    shouldStackHeader?: boolean;

    /** Whether the stacked header will render a "Switch accounts" button below the login, so its row can be reserved */
    shouldShowSwitchButton?: boolean;

    /** Additional styles for the skeleton view */
    style?: StyleProp<ViewStyle>;
};

function AccountSwitcherSkeletonView({
    shouldAnimate = true,
    avatarSize = CONST.AVATAR_SIZE.DEFAULT,
    width,
    shouldStackHeader = false,
    shouldShowSwitchButton = false,
    style,
}: AccountSwitcherSkeletonViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(avatarSize);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const startPositionX = avatarPlaceholderRadius;
    const rectXTranslation = startPositionX + avatarPlaceholderRadius + styles.gap3.gap;

    const [measuredWidth, setMeasuredWidth] = useState(0);
    const stackedWidth = width ?? measuredWidth;
    const onLayout = (event: LayoutChangeEvent) => setMeasuredWidth(event.nativeEvent.layout.width);

    const nameLineTop = avatarPlaceholderSize + styles.gap3.gap;
    const loginLineTop = nameLineTop + variables.lineHeightSizeH1 + styles.gap1.gap;
    const loginLineBottom = loginLineTop + variables.lineHeightNormal;
    const switchButtonTop = loginLineBottom + styles.gap4.gap;
    const stackedHeight = shouldShowSwitchButton ? switchButtonTop + variables.componentSizeSmall : loginLineBottom;

    const nameBarWidth = stackedWidth * NAME_BAR_WIDTH_RATIO;
    const loginBarWidth = stackedWidth * LOGIN_BAR_WIDTH_RATIO;

    return (
        <View
            style={[width ? undefined : styles.avatarSectionWrapperSkeleton, style]}
            onLayout={shouldStackHeader && width === undefined ? onLayout : undefined}
        >
            {shouldStackHeader && !stackedWidth ? (
                <View style={StyleUtils.getHeight(stackedHeight)} />
            ) : (
                <SkeletonViewContentLoader
                    animate={shouldAnimate}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                    width={shouldStackHeader ? stackedWidth : width}
                    height={shouldStackHeader ? stackedHeight : avatarPlaceholderSize}
                >
                    <Circle
                        cx={shouldStackHeader ? stackedWidth / 2 : startPositionX}
                        cy={avatarPlaceholderRadius}
                        r={avatarPlaceholderRadius}
                    />
                    {shouldStackHeader ? (
                        <>
                            <SkeletonRect
                                transform={[{translateX: (stackedWidth - nameBarWidth) / 2}, {translateY: nameLineTop + (variables.lineHeightSizeH1 - BAR_HEIGHT) / 2}]}
                                width={nameBarWidth}
                                height={BAR_HEIGHT}
                            />
                            <SkeletonRect
                                transform={[{translateX: (stackedWidth - loginBarWidth) / 2}, {translateY: loginLineTop + (variables.lineHeightNormal - BAR_HEIGHT) / 2}]}
                                width={loginBarWidth}
                                height={BAR_HEIGHT}
                            />
                            {!!shouldShowSwitchButton && (
                                <SkeletonRect
                                    transform={[{translateX: (stackedWidth - SWITCH_BUTTON_WIDTH) / 2}, {translateY: switchButtonTop}]}
                                    width={SWITCH_BUTTON_WIDTH}
                                    height={variables.componentSizeSmall}
                                    borderRadius={variables.buttonBorderRadius}
                                />
                            )}
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </SkeletonViewContentLoader>
            )}
        </View>
    );
}

export default AccountSwitcherSkeletonView;
