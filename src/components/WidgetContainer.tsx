import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import Text from './Text';

type WidgetContainerProps = {
    /** The icon to display along with the title */
    icon?: IconAsset;

    /** The text to display in the title of the widget */
    title?: string;

    /** Custom color for the title text */
    titleColor?: string;

    /** The width of the icon. */
    iconWidth?: number;

    /** The height of the icon. */
    iconHeight?: number;

    /** The content to display inside the widget container */
    children: ReactNode;

    /** Additional styles to pass to the container */
    containerStyles?: StyleProp<ViewStyle>;
};

function WidgetContainer({children, icon, title, titleColor, iconWidth = variables.iconSizeNormal, iconHeight = variables.iconSizeNormal, containerStyles}: WidgetContainerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[styles.widgetContainer, containerStyles]}>
            <View style={[styles.flexRow, styles.alignItemsStart, styles.mb5, shouldUseNarrowLayout ? styles.mh5 : styles.mh8, shouldUseNarrowLayout ? styles.mt5 : styles.mt8]}>
                {!!icon && (
                    <View style={[styles.flexGrow0, styles.flexShrink0]}>
                        <Icon
                            src={icon}
                            width={iconWidth}
                            height={iconHeight}
                        />
                    </View>
                )}
                <View style={[styles.flexShrink1, styles.flexGrow1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    {!!title && <Text style={styles.getWidgetContainerTitleStyle(titleColor ?? theme.text)}>{title}</Text>}
                </View>
            </View>
            {children}
        </View>
    );
}

export type {WidgetContainerProps};
export default WidgetContainer;
