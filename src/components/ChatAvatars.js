import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import ChatCustomAvatar from './ChatCustomAvatar';
import ActiveRoomAvatar from '../../assets/images/avatars/room.svg';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),


    /** Whether this avatar is for an custom room */
    isCustomChatRoom: PropTypes.bool,

    /** Whether this avatar is for an custom room */
    CustomChatRoomIcon: PropTypes.any

};

const defaultProps = {
    avatarImageURLs: [],
    isCustomChatRoom: false,
    CustomChatRoomIcon: ActiveRoomAvatar
};

const ChatAvatars = ({avatarImageURLs, isCustomChatRoom, CustomChatRoomIcon}) => {
    const avatarContainerStyles = styles.emptyAvatar;

    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1 || isCustomChatRoom) {
        return (
            <ChatCustomAvatar
                source={avatarImageURLs[0]}
                imageStyles={[styles.avatarLarge]}
                isCustomChatRoom = {isCustomChatRoom}
                CustomChatRoomIcon = {CustomChatRoomIcon}
            />
        );
    }

    return (
        <View pointerEvents="none" style={avatarContainerStyles}>
            <View style={styles.flexRow}>
                {avatarImageURLs.map((val, index) => {
                    if (index <= 3) {
                        return (
                            <View style={[styles.chatAvatarWraper]}>
                                <Image source={{uri: val}} style={[styles.chatAvatar]} />

                                {index === 3 && (
                                    <View
                                        style={[
                                            styles.chatAvatar,
                                            styles.justifyContentCenter,
                                            styles.alignItemsCenter,
                                            styles.chatOverLay,
                                        ]}
                                    >
                                        <Text style={styles.avatarInnerTextChat}>
                                            {`+${avatarImageURLs.length}`}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    }
                    return null;
                })}
            </View>
        </View>
    );
};

ChatAvatars.defaultProps = defaultProps;
ChatAvatars.propTypes = propTypes;
export default memo(ChatAvatars);
