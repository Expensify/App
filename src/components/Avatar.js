import React, {PureComponent} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import RoomAvatar from '../../assets/images/avatars/room.svg';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),

    /** Whether this avatar is for a default room */
    isDefaultChatRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isDefaultChatRoom: false,
};

class Avatar extends PureComponent {
    render() {
        if (!this.props.source && !this.props.isDefaultChatRoom) {
            return null;
        }

        const imageStyle = [
            this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
            ...this.props.imageStyles,
        ];
        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {this.props.isDefaultChatRoom
                    ? <RoomAvatar style={StyleSheet.flatten(imageStyle)} />
                    : <Image source={{uri: this.props.source}} style={imageStyle} />}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
