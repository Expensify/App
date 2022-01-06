import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import CONST from '../CONST';
import Avatar from './Avatar';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    /** Whether this avatar is for a custom/default room */
    isChatRoom: PropTypes.bool,
};

const defaultProps = {
    avatarImageURLs: [],
    isChatRoom: false,
};

const EmptyStateAvatars = (props) => {
    if (!props.avatarImageURLs.length) {
        return null;
    }

    if (props.avatarImageURLs.length === 1 || props.isChatRoom) {
        return (
            <Avatar
                source={props.avatarImageURLs[0]}
                imageStyles={[styles.avatarLarge]}
                isChatRoom={props.isChatRoom}
            />
        );
    }

    // avatarImageURLsToDisplay
    const avatarImageURLsToDisplay = props.avatarImageURLs.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    return (
        <View pointerEvents="none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {_.map(avatarImageURLsToDisplay, (val, index) => (
                    <View key={val} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <Image source={{uri: val}} style={[styles.emptyStateAvatar]} />

                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && props.avatarImageURLs.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                            <>
                                <View
                                    style={[
                                        styles.emptyStateAvatar,
                                        styles.screenBlur,
                                    ]}
                                />
                                <Text style={styles.avatarInnerTextChat}>
                                    {`+${props.avatarImageURLs.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}
                                </Text>
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

EmptyStateAvatars.defaultProps = defaultProps;
EmptyStateAvatars.propTypes = propTypes;
EmptyStateAvatars.displayName = 'EmptyStateAvatars';

export default memo(EmptyStateAvatars);
