import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ButtonVariant} from '@styles/utils/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import Text from './Text';

const ICON_SIZE = variables.iconSizeNormal;

type BaseWidgetItemProps = {
    /** Icon to display */
    icon: IconAsset;

    /** Primary title text */
    title: string;

    /** Secondary subtitle text */
    subtitle?: string;

    /** Text for the CTA button */
    ctaText: string;

    /** Callback when CTA is pressed */
    onCtaPress: () => void;

    /** The visual variant of the CTA button */
    buttonVariant?: ButtonVariant;
};

function BaseWidgetItem({icon, title, subtitle, ctaText, onCtaPress, buttonVariant}: BaseWidgetItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={title}
            onPress={onCtaPress}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.WIDGET_ITEM}
        >
            {({hovered}) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8, hovered && styles.hoveredComponentBG]}>
                    <View style={styles.widgetItemIconContainer}>
                        <Icon
                            src={icon}
                            width={ICON_SIZE}
                            height={ICON_SIZE}
                            fill={theme.icon}
                        />
                    </View>
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>
                        {!!subtitle && <Text style={styles.widgetItemSubtitle}>{subtitle}</Text>}
                        <Text style={styles.widgetItemTitle}>{title}</Text>
                    </View>
                    <Button
                        onPress={onCtaPress}
                        size={CONST.BUTTON_SIZE.SMALL}
                        style={styles.widgetItemButton}
                        variant={buttonVariant}
                    >
                        <Button.Text>{ctaText}</Button.Text>
                    </Button>
                </View>
            )}
        </PressableWithoutFeedback>
    );
}

export default BaseWidgetItem;
