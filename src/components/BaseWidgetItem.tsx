import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import Icon from './Icon';
import Text from './Text';

const ICON_SIZE = variables.iconSizeNormal;

type BaseWidgetItemProps = {
    /** Icon to display */
    icon: IconAsset;

    /** Background color for the icon container */
    iconBackgroundColor: string;

    /** Primary title text */
    title: string;

    /** Secondary subtitle text */
    subtitle?: string;

    /** Text for the CTA button */
    ctaText: string;

    /** Callback when CTA is pressed */
    onCtaPress: () => void;

    /** Optional: fill color for the icon (defaults to white) */
    iconFill?: string;

    /** Whether the CTA button should use danger styling instead of success */
    isDanger?: boolean;
};

function BaseWidgetItem({icon, iconBackgroundColor, title, subtitle, ctaText, onCtaPress, iconFill, isDanger = false}: BaseWidgetItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            <View style={styles.getWidgetItemIconContainerStyle(iconBackgroundColor)}>
                <Icon
                    src={icon}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    fill={iconFill ?? theme.white}
                />
            </View>
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                {!!subtitle && <Text style={styles.widgetItemSubtitle}>{subtitle}</Text>}
                <Text style={styles.widgetItemTitle}>{title}</Text>
            </View>
            <Button
                text={ctaText}
                onPress={onCtaPress}
                success={!isDanger}
                danger={isDanger}
                small
                style={styles.widgetItemButton}
            />
        </View>
    );
}

export default BaseWidgetItem;
export type {BaseWidgetItemProps};
