import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';
import CONST from '../CONST';
import Avatar from './Avatar';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    /** Whether this avatar is for an custom room */
    isCustomChatRoom: PropTypes.bool,
};

const defaultProps = {
    avatarImageURLs: [],
    isCustomChatRoom: false,
};

const EmptyStateAvatars = ({avatarImageURLs, isCustomChatRoom}) => {
    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1 || isCustomChatRoom) {
        return (
            <Avatar
                source={avatarImageURLs[0]}
                imageStyles={[styles.avatarLarge]}
                isDefaultChatRoom={isCustomChatRoom}
            />
        );
    }

    return (
        <View pointerEvents="none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {avatarImageURLs.map((val, index) => {
                    if (index <= CONST.REPORT.MAX_PREVIEW_AVATARS - 1) {
                        return (
                            <View key={val} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                                <Image source={{uri: val}} style={[styles.emptyStateAvatar]} />

                                {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && avatarImageURLs.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                                    <>
                                        <View
                                            style={[
                                                styles.emptyStateAvatar,
                                                styles.chatOverLay,
                                            ]}
                                        />
                                        <Text style={styles.avatarInnerTextChat}>
                                            {`+${avatarImageURLs.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}
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
EmptyStateAvatars.displayName = 'EmptyStateAvatars';

export default memo(EmptyStateAvatars);
