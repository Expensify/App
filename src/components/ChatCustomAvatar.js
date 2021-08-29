import React, { PureComponent } from 'react';
import { Image, View ,StyleSheet } from 'react-native';
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
        /** Whether this avatar is for an custom room */
        CustomChatRoomIcon: PropTypes.any,

};

const defaultProps = {
    source: '',
    imageStyles: [],
    containerStyles: [],
    size: 'default',
    isCustomChatRoom: false,
    CustomChatRoomIcon: ActiveRoomAvatar,


};

class ChatCustomAvatar extends PureComponent {

    render() {
        const {CustomChatRoomIcon}= this.props;
        if (!this.props.source && !this.props.isCustomChatRoom) {
            return null;
        }

        const imageStyle = [
            this.props.size === 'small' ? styles.avatarSmall : styles.avatarNormal,
            ...this.props.imageStyles,
        ];
        return (
            <View pointerEvents="none" style={this.props.containerStyles}>
                {this.props.isCustomChatRoom
                    ? <CustomChatRoomIcon style={StyleSheet.flatten(imageStyle)} />
                    : <Image source={{ uri: this.props.source }} style={imageStyle} />}
            </View>
        );
    }
}

ChatCustomAvatar.defaultProps = defaultProps;
ChatCustomAvatar.propTypes = propTypes;
export default ChatCustomAvatar;
