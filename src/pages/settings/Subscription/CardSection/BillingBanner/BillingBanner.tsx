import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useMemo} from 'react';
import {View} from 'react-native';

type BillingBannerProps = {
    title: string | React.ReactNode;
    subtitle: string | React.ReactNode;

    /** The icon to display in the banner. */
    icon: IconAsset;

    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Styles to apply to the container. */
    style?: StyleProp<ViewStyle>;

    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;

    /** An icon to be rendered instead of the RBR / GBR indicator. */
    rightIcon?: IconAsset;

    onRightIconPress?: () => void;
    rightIconAccessibilityLabel?: string;

    /** Sentry label for the right icon button. Defaults to `CONST.SENTRY_LABEL.BILLING_BANNER.RIGHT_ICON`. */
    rightIconSentryLabel?: string;

    /** A component to be rendered on the right side of the banner. */
    rightComponent?: React.ReactNode;
};

function BillingBanner({
    title,
    subtitle,
    icon,
    brickRoadIndicator,
    style,
    titleStyle,
    subtitleStyle,
    rightIcon,
    onRightIconPress,
    rightIconAccessibilityLabel,
    rightIconSentryLabel,
    rightComponent,
}: BillingBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const rightIconComponent = useMemo(() => {
        if (rightIcon) {
            return onRightIconPress && rightIconAccessibilityLabel ? (
                <PressableWithoutFeedback
                    onPress={onRightIconPress}
                    style={[styles.touchableButtonImage, styles.threeDotsMenuIconWidth]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={rightIconAccessibilityLabel}
                    sentryLabel={rightIconSentryLabel ?? CONST.SENTRY_LABEL.BILLING_BANNER.RIGHT_ICON}
                >
                    <Icon
                        src={rightIcon}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            ) : (
                <Icon
                    src={rightIcon}
                    fill={theme.icon}
                />
            );
        }

        return (
            !!brickRoadIndicator && (
                <Icon
                    src={expensifyIcons.DotIndicator}
                    fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}
                />
            )
        );
    }, [
        brickRoadIndicator,
        onRightIconPress,
        rightIcon,
        rightIconAccessibilityLabel,
        rightIconSentryLabel,
        styles.touchableButtonImage,
        styles.threeDotsMenuIconWidth,
        theme.danger,
        theme.icon,
        theme.success,
        expensifyIcons.DotIndicator,
    ]);

    return (
        <View style={[styles.pv4, styles.ph5, styles.flexRow, styles.flexWrap, styles.gap3, styles.w100, styles.alignItemsCenter, styles.trialBannerBackgroundColor, style]}>
            <Icon
                src={icon}
                width={variables.menuIconSize}
                height={variables.menuIconSize}
            />

            <View style={[styles.flex1, styles.justifyContentCenter]}>
                {typeof title === 'string' ? <Text style={[styles.textStrong, titleStyle]}>{title}</Text> : title}
                {!!subtitle && (typeof subtitle === 'string' ? <Text style={subtitleStyle}>{subtitle}</Text> : subtitle)}
            </View>
            {shouldUseNarrowLayout && !isInLandscapeMode ? (
                <>
                    {rightIconComponent}
                    {!!rightComponent && rightComponent}
                </>
            ) : (
                <>
                    {!!rightComponent && rightComponent}
                    {rightIconComponent}
                </>
            )}
        </View>
    );
}

export default BillingBanner;
export type {BillingBannerProps};
