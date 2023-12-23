import {ImageContentFit} from 'expo-image';
import React, {PureComponent} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import withStyleUtils, {WithStyleUtilsProps} from '@components/withStyleUtils';
import withTheme, {WithThemeProps} from '@components/withTheme';
import withThemeStyles, {type WithThemeStylesProps} from '@components/withThemeStyles';
import variables from '@styles/variables';
import IconAsset from '@src/types/utils/IconAsset';
import IconWrapperStyles from './IconWrapperStyles';

type IconBaseProps = {
    /** The asset to render. */
    src: IconAsset;

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

    /** Used to locate this icon in end-to-end tests. */
    testID?: string;

    /** Determines how the image should be resized to fit its container */
    contentFit?: ImageContentFit;
};
type IconProps = IconBaseProps & WithThemeStylesProps & WithThemeProps & WithStyleUtilsProps;

// We must use a class component to create an animatable component with the Animated API
// eslint-disable-next-line react/prefer-stateless-function
class Icon extends PureComponent<IconProps> {
    // eslint-disable-next-line react/static-property-placement
    public static defaultProps: Partial<IconBaseProps> = {
        width: variables.iconSizeNormal,
        height: variables.iconSizeNormal,
        fill: undefined,
        small: false,
        inline: false,
        additionalStyles: [],
        hovered: false,
        pressed: false,
        testID: '',
        contentFit: 'cover',
    };

    render() {
        const width = this.props.small ? variables.iconSizeSmall : this.props.width;
        const height = this.props.small ? variables.iconSizeSmall : this.props.height;
        const iconStyles = [this.props.StyleUtils.getWidthAndHeightStyle(width ?? 0, height), IconWrapperStyles, this.props.themeStyles.pAbsolute, this.props.additionalStyles];

        if (this.props.inline) {
            return (
                <View
                    testID={this.props.testID}
                    style={[this.props.StyleUtils.getWidthAndHeightStyle(width ?? 0, height), this.props.themeStyles.bgTransparent, this.props.themeStyles.overflowVisible]}
                >
                    <View style={iconStyles}>
                        <ImageSVG
                            src={this.props.src}
                            width={width}
                            height={height}
                            fill={this.props.fill}
                            hovered={this.props.hovered}
                            pressed={this.props.pressed}
                            contentFit={this.props.contentFit}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View
                testID={this.props.testID}
                style={this.props.additionalStyles}
            >
                <ImageSVG
                    src={this.props.src}
                    width={width}
                    height={height}
                    fill={this.props.fill}
                    hovered={this.props.hovered}
                    pressed={this.props.pressed}
                    contentFit={this.props.contentFit}
                />
            </View>
        );
    }
}

export default withTheme(withThemeStyles(withStyleUtils(Icon)));
