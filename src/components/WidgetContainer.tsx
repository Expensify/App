import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type WidgetContainerProps = {
    /** The text to display in the title of the widget */
    title?: string;

    /** The content to display inside the widget container */
    children: ReactNode;

    /** Additional styles to pass to the container */
    containerStyles?: StyleProp<ViewStyle>;
};

function WidgetContainer({children, title, containerStyles}: WidgetContainerProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[styles.widgetContainer, containerStyles]}>
            <View style={styles.getWidgetContainerHeaderStyle(shouldUseNarrowLayout)}>
                <View style={[styles.flexShrink1, styles.flexGrow1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    {!!title && <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{title}</Text>}
                </View>
            </View>
            {children}
        </View>
    );
}

export type {WidgetContainerProps};
export default WidgetContainer;
