import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import ActiveRoomAvatar from '../../assets/images/avatars/room.svg';

const propTypes = {
    /** Url source for the avatar */
    source: PropTypes.string,

    /** Extra styles to pass to Image */
    imageStyles: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles to pass to View wrapper */
    containerStyles: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

    /** Set the size of ChatCustomAvatar */
    size: PropTypes.oneOf(['default', 'small']),

    /** Whether this avatar is for an custom room */
    isCustomChatRoom: PropTypes.bool,
};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isCustomChatRoom: false,
};

const ChatCustomAvatar = (props) => {
    const {isCustomChatRoom} = props;
    if (!props.source && !props.isCustomChatRoom) {
        return null;
    }
    const imageStyle = [
        props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
        ...props.imageStyles,
    ];
    return (
        <View pointerEvents="none" style={props.containerStyles}>
            {isCustomChatRoom
                ? <ActiveRoomAvatar style={StyleSheet.flatten(imageStyle)} />
                : <Image source={{uri: props.source}} style={imageStyle} />}
        </View>
    );
};

ChatCustomAvatar.defaultProps = defaultProps;
ChatCustomAvatar.propTypes = propTypes;
ChatCustomAvatar.displayName = 'ChatCustomAvatar';

export default ChatCustomAvatar;
