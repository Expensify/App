import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';
import Icon from './Icon';
import variables from '../styles/variables';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';


const propTypes = {
    /** Source for the avatar. Can be the URL of an image or an icon. */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Whether this avatar is for a chat room */
    isChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived default room */
    isArchivedRoom: PropTypes.bool,

    /** Whether this avatar is for a policyExpenseChat */
    isPolicyExpenseChat: PropTypes.bool,

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue' */
    fill: PropTypes.string,
};

const defaultProps = {
    imageStyles: [],
    containerStyles: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    isChatRoom: false,
    isArchivedRoom: false,
    isPolicyExpenseChat: false,
    fill: themeColors.icon,
};

class Avatar extends PureComponent {
    render() {
        let source = this.props.source;
        if (!source) {
            if (this.props.isChatRoom) {
                source = Expensicons.ActiveRoomAvatar;
            }
            if (this.props.isArchivedRoom) {
                source = Expensicons.DeletedRoomAvatar;
            }
            if (this.props.isPolicyExpenseChat) {
                source = Expensicons.Workspace;
            }
        }

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
