import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';


const propTypes = {
    /** Source for the avatar. Can be the URL of an image or an icon. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue' */
    fill: PropTypes.string,
};

const defaultProps = {
    source: null,
    imageStyles: [],
    containerStyles: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    fill: themeColors.icon,
};

class Avatar extends PureComponent {
    render() {
        const source = this.props.source;
        if (!source) {
            return null;
        }

        const imageStyle = [
            this.props.size === CONST.AVATAR_SIZE.SMALL ? styles.avatarSmall : styles.avatarNormal,
            ...this.props.imageStyles,
        ];

        const AVATAR_SIZES = {
            [CONST.AVATAR_SIZE.DEFAULT]: variables.avatarSizeNormal,
            [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.avatarSizeSubscript,
            [CONST.AVATAR_SIZE.SMALL]: variables.avatarSizeSmall,
            [CONST.AVATAR_SIZE.LARGE]: variables.avatarSizeLarge,
        };
        const iconSize = AVATAR_SIZES[this.props.size];
        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {
                _.isFunction(source)
                    ? <Icon src={source} fill={this.props.fill} height={iconSize} width={iconSize} />
                    : <Image source={{uri: source}} style={imageStyle} />
            }
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
