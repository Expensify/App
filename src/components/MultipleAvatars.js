import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Avatar from './Avatar';
import ExpensifyText from './ExpensifyText';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    /** Set the sie of avatars */
    size: PropTypes.oneOf(['default', 'small']),

    /** Style for Second Avatar */
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.arrayOf(PropTypes.object),

    /** Whether this avatar is for a default room */
    isDefaultChatRoom: PropTypes.bool,

    /** Whether this avatar is for an archived room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    avatarImageURLs: [],
    size: 'default',
    secondAvatarStyle: [styles.secondAvatarHovered],
    isDefaultChatRoom: false,
    isArchivedRoom: false,
};

const MultipleAvatars = (props) => {
    const avatarContainerStyles = props.size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar;
    const singleAvatarStyles = props.size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [
        props.size === 'small' ? styles.secondAvatarSmall : styles.secondAvatar,
        ...props.secondAvatarStyle,
    ];

    if (!props.avatarImageURLs.length) {
        return null;
    }

    if (props.avatarImageURLs.length === 1) {
        return (
            <View style={avatarContainerStyles}>
                <Avatar
                    source={props.avatarImageURLs[0]}
                    size={props.size}
                    isDefaultChatRoom={props.isDefaultChatRoom}
                    isArchivedRoom={props.isArchivedRoom}
                />
            </View>
        );
    }

    return (
        <View pointerEvents="none" style={avatarContainerStyles}>
            <View
                style={singleAvatarStyles}
            >
                <Image
                    source={{uri: props.avatarImageURLs[0]}}
                    style={singleAvatarStyles}
                />
                <View
                    style={secondAvatarStyles}
                >
                    {props.avatarImageURLs.length === 2 ? (
                        <Image
                            source={{uri: props.avatarImageURLs[1]}}
                            style={singleAvatarStyles}
                        />
                    ) : (
                        <View
                            style={[singleAvatarStyles, styles.alignItemsCenter, styles.justifyContentCenter]}
                        >
                            <ExpensifyText style={props.size === 'small'
                                ? styles.avatarInnerTextSmall
                                : styles.avatarInnerText}
                            >
                                {`+${props.avatarImageURLs.length - 1}`}
                            </ExpensifyText>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
export default memo(MultipleAvatars);
