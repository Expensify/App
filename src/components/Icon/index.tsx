import React, {PureComponent} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import withStyleUtils, {WithStyleUtilsProps} from '@components/withStyleUtils';
import withTheme, {WithThemeProps} from '@components/withTheme';
import withThemeStyles, {type WithThemeStylesProps} from '@components/withThemeStyles';
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
} & WithThemeStylesProps &
    WithThemeProps &
    WithStyleUtilsProps;

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent<IconProps> {
    // eslint-disable-next-line react/static-property-placement
    public static defaultProps = {
        width: variables.iconSizeNormal,
        height: variables.iconSizeNormal,
        fill: undefined,
        small: false,
        inline: false,
        additionalStyles: [],
        hovered: false,
        pressed: false,
    };

    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const iconStyles = [this.props.StyleUtils.getWidthAndHeightStyle(width ?? 0, height), IconWrapperStyles, this.props.themeStyles.pAbsolute, this.props.additionalStyles];
        const fill = this.props.fill ?? this.props.theme.icon;

        if (this.props.inline) {
            return (
                <View
                    testID={`${this.props.src.name} Icon`}
                    style={[this.props.StyleUtils.getWidthAndHeightStyle(width ?? 0, height), this.props.themeStyles.bgTransparent, this.props.themeStyles.overflowVisible]}
                >
                    <View style={iconStyles}>
                        <this.props.src
                            width={width}
                            height={height}
                            fill={fill}
                            hovered={this.props.hovered?.toString()}
                            pressed={this.props.pressed?.toString()}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View
                testID={`${this.props.src.name} Icon`}
                style={this.props.additionalStyles}
            >
                <this.props.src
                    width={width}
                    height={height}
                    fill={fill}
                    hovered={this.props.hovered?.toString()}
                    pressed={this.props.pressed?.toString()}
                />
            </View>
        );
    }
}

export default withTheme(withThemeStyles(withStyleUtils(Icon)));
