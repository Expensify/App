import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
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
};

function BaseWidgetItem({icon, iconBackgroundColor, title, subtitle, ctaText, onCtaPress, iconFill}: BaseWidgetItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={title}
            onPress={onCtaPress}
            role={CONST.ROLE.BUTTON}
        >
            {({hovered}) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, hovered && styles.hoveredComponentBG]}>
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
                        success
                        small
                        style={styles.widgetItemButton}
                    />
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default BaseWidgetItem;
export type {BaseWidgetItemProps};
