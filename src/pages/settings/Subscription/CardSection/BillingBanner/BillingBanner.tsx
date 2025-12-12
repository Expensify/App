import React, {useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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

type BillingBannerProps = {
    /** The title of the banner. */
    title: string | React.ReactNode;

    /** The subtitle of the banner. */
    subtitle: string | React.ReactNode;

    /** The icon to display in the banner. */
    icon: IconAsset;

    /** The type of brick road indicator to show. */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;

    /** Styles to apply to the container. */
    style?: StyleProp<ViewStyle>;

    /** Styles to apply to the title. */
    titleStyle?: StyleProp<TextStyle>;

    /** Styles to apply to the subtitle. */
    subtitleStyle?: StyleProp<TextStyle>;

    /** An icon to be rendered instead of the RBR / GBR indicator. */
    rightIcon?: IconAsset;

    /** Callback to be called when the right icon is pressed. */
    onRightIconPress?: () => void;

    /** Accessibility label for the right icon. */
    rightIconAccessibilityLabel?: string;

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
    rightComponent,
}: BillingBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator'] as const);

    const rightIconComponent = useMemo(() => {
        if (rightIcon) {
            return onRightIconPress && rightIconAccessibilityLabel ? (
                <PressableWithoutFeedback
                    onPress={onRightIconPress}
                    style={[styles.touchableButtonImage]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={rightIconAccessibilityLabel}
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
    }, [brickRoadIndicator, onRightIconPress, rightIcon, rightIconAccessibilityLabel, styles.touchableButtonImage, theme.danger, theme.icon, theme.success, expensifyIcons.DotIndicator]);

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
            {shouldUseNarrowLayout ? (
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

BillingBanner.displayName = 'BillingBanner';

export default BillingBanner;
export type {BillingBannerProps};
