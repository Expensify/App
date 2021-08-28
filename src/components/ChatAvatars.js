import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Avatar from './Avatar';
import Text from './Text';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    /** Whether this avatar is for a default room */
    isDefaultChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived room */
    isArchivedRoom: PropTypes.bool,

    /** Whether this avatar is for an archived room */
};

const defaultProps = {
    avatarImageURLs: [],
    isDefaultChatRoom: false,
    isArchivedRoom: false,
};

const ChatAvatars = ({avatarImageURLs, isDefaultChatRoom, isArchivedRoom}) => {
    const avatarContainerStyles = styles.emptyAvatar;

    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1) {
        return (
            <Avatar
                source={avatarImageURLs[0]}
                isDefaultChatRoom={isDefaultChatRoom}
                isArchivedRoom={isArchivedRoom}
                imageStyles={[styles.avatarLarge]}
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
