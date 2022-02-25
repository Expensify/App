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

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: stylePropTypes,

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),

    /** Whether this avatar is for a chat room */
    isChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived default room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isChatRoom: false,
    isArchivedRoom: false,
};

class Avatar extends PureComponent {
    render() {
        let source = this.props.source;
        if (this.props.isChatRoom) {
            source = Expensicons.ActiveRoomAvatar;
        }
        if (this.props.isArchivedRoom) {
            source = Expensicons.DeletedRoomAvatar;
        }

        if (!source) {
            return null;
        }

        const imageStyle = [
            this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,

            // Background color isn't added for room avatar because it changes it's shape to a square
            this.props.isChatRoom ? {} : {backgroundColor: themeColors.icon},
            ...this.props.imageStyles,
        ];

        const iconSize = this.props.size === 'small' ? variables.avatarSizeSmall : variables.avatarSizeNormal;

        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {
                _.isFunction(source)
                    ? <Icon src={source} height={iconSize} width={iconSize} />
                    : <Image source={{uri: source}} style={imageStyle} />
            }
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
