import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
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
};

function BillingBanner({title, subtitle, icon, brickRoadIndicator, style, titleStyle, subtitleStyle}: BillingBannerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.pv4, styles.ph5, styles.flexRow, styles.gap3, styles.w100, styles.alignItemsCenter, styles.trialBannerBackgroundColor, style]}>
            <Icon
                src={icon}
                width={variables.menuIconSize}
                height={variables.menuIconSize}
            />

            <View style={[styles.flex1, styles.justifyContentCenter]}>
                {typeof title === 'string' ? <Text style={[styles.textStrong, titleStyle]}>{title}</Text> : title}
                {typeof subtitle === 'string' ? <Text style={subtitleStyle}>{subtitle}</Text> : subtitle}
            </View>

            {!!brickRoadIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? theme.danger : theme.success}
                />
            )}
        </View>
    );
}

BillingBanner.displayName = 'BillingBanner';

export default BillingBanner;
