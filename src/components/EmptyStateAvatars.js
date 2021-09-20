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
    CustomChatRoomIcon: PropTypes.func,

};

const defaultProps = {
    avatarImageURLs: [],
    isCustomChatRoom: false,
    CustomChatRoomIcon: ActiveRoomAvatar,
};

const EmptyStateAvatars = ({avatarImageURLs, isCustomChatRoom, CustomChatRoomIcon}) => {
    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1 || isCustomChatRoom) {
        return (
            <ChatCustomAvatar
                source={avatarImageURLs[0]}
                imageStyles={[styles.avatarLarge]}
                isCustomChatRoom={isCustomChatRoom}
                CustomChatRoomIcon={CustomChatRoomIcon}
            />
        );
    }

    return (
        <View pointerEvents="none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {avatarImageURLs.map((val, index) => {
                    if (index <= 3) {
                        return (
                            <View key={val} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                                <Image source={{uri: val}} style={[styles.emptyStateAvatar]} />

                                {index === 3 && (
                                    <>
                                        <View
                                            style={[
                                                styles.emptyStateAvatar,
                                                styles.chatOverLay,
                                            ]}
                                        />
                                        <Text style={styles.avatarInnerTextChat}>
                                            {`+${avatarImageURLs.length - 4}`}
                                        </Text>
                                    </>
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

EmptyStateAvatars.defaultProps = defaultProps;
EmptyStateAvatars.propTypes = propTypes;
export default memo(EmptyStateAvatars);
