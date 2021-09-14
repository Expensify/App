import React, {PureComponent} from 'react';
import {Image, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import RoomAvatar from './RoomAvatar';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

    /** Set the size of Avatar */
    size: PropTypes.oneOf(['default', 'small']),

    /** Whether this avatar is for a default room */
    isDefaultChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived default room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isDefaultChatRoom: false,
    isArchivedRoom: false,
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
                    ? <RoomAvatar avatarStyle={imageStyle} isArchived={this.props.isArchivedRoom} />
                    : <Image source={{uri: this.props.source}} style={imageStyle} />}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
