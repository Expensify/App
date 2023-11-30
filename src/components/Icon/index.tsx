import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import withTheme, {ThemeProps} from '@components/withTheme';
import withThemeStyles, {ThemeStylesProps} from '@components/withThemeStyles';
import * as StyleUtils from '@styles/StyleUtils';
import variables from '@styles/variables';
import IconWrapperStyles from './IconWrapperStyles';

type SrcProps = {
    width?: number;
    height?: number;
    fill?: string;
    hovered?: string;
    pressed?: string;
};

type IconProps = {
    /** The asset to render. */
    src: (props: SrcProps) => React.ReactNode;

    /** The width of the icon. */
    width?: number;

    /** The height of the icon. */
    height?: number;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill?: string;

    /** Is small icon */
    small?: boolean;

    /** Is inline icon */
    inline?: boolean;

    /** Is icon hovered */
    hovered?: boolean;

    /** Is icon pressed */
    pressed?: boolean;

    /** Additional styles to add to the Icon */
    additionalStyles?: StyleProp<ViewStyle>;
} & ThemeStylesProps &
    ThemeProps;

const defaultProps = {
    width: variables.iconSizeNormal,
    height: variables.iconSizeNormal,
    fill: undefined,
    small: false,
    inline: false,
    additionalStyles: [],
    hovered: false,
    pressed: false,
};

function Icon({src, width, height, fill, small, inline, hovered, pressed, theme, themeStyles, additionalStyles}: IconProps) {
    const iconWidth = small ? variables.iconSizeSmall : width;
    const iconHeight = small ? variables.iconSizeSmall : height;
    const iconStyles = [StyleUtils.getWidthAndHeightStyle(width ?? 0, height), IconWrapperStyles, themeStyles.pAbsolute, additionalStyles];
    const iconFill = fill ?? theme.icon;
    const IconComponent = src;

    if (inline) {
        return (
            <View
                testID={`${src.name} Icon`}
                style={[StyleUtils.getWidthAndHeightStyle(width ?? 0, height), themeStyles.bgTransparent, themeStyles.overflowVisible]}
            >
                <View style={iconStyles}>
                    <IconComponent
                        width={iconWidth}
                        height={iconHeight}
                        fill={iconFill}
                        hovered={hovered?.toString()}
                        pressed={pressed?.toString()}
                    />
                </View>
            </View>
        );
    }

    return (
        <View
            testID={`${src.name} Icon`}
            style={additionalStyles}
        >
            <IconComponent
                width={iconWidth}
                height={iconHeight}
                fill={iconFill}
                hovered={hovered?.toString()}
                pressed={pressed?.toString()}
            />
        </View>
    );
}

Icon.defaultProps = defaultProps;
Icon.displayName = 'Icon';

export default withTheme(withThemeStyles(Icon));
