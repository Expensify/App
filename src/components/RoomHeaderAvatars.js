import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import CONST from '../CONST';
import Avatar from './Avatar';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /** Array of avatar URLs or icons */
    avatarIcons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    /** Whether show large Avatars */
    shouldShowLargeAvatars: PropTypes.bool,
};

const defaultProps = {
    avatarIcons: [],
    shouldShowLargeAvatars: false,
};

const RoomHeaderAvatars = (props) => {
    if (!props.avatarIcons.length) {
        return null;
    }

    if (props.avatarIcons.length === 1) {
        return (
            <Avatar
                source={props.avatarIcons[0]}
                imageStyles={[styles.avatarLarge]}
                fill={themeColors.iconSuccessFill}
                size={CONST.AVATAR_SIZE.LARGE}
            />
        );
    }

    if (props.shouldShowLargeAvatars) {
        return (
            <View style={[styles.flexRow, styles.wAuto, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <View style={styles.leftSideLargeAvatar}>
                    <Avatar
                        source={props.avatarIcons[1]}
                        imageStyles={[styles.avatarLarge]}
                        size={CONST.AVATAR_SIZE.LARGE}
                        fill={themeColors.iconSuccessFill}
                    />
                </View>
                <View style={[styles.rightSideLargeAvatar, StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)]}>
                    <Avatar
                        source={props.avatarIcons[0]}
                        imageStyles={[styles.avatarLarge]}
                        size={CONST.AVATAR_SIZE.LARGE}
                    />
                </View>
            </View>
        );
    }

    const avatarIconsToDisplay = props.avatarIcons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);
    return (
        <View pointerEvents="none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {_.map(avatarIconsToDisplay, (val, index) => (
                    <View key={val} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <Image source={{uri: val}} style={[styles.roomHeaderAvatar]} />

                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && props.avatarIcons.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                            <>
                                <View
                                    style={[
                                        styles.roomHeaderAvatar,
                                        styles.screenBlur,
                                    ]}
                                />
                                <Text style={styles.avatarInnerTextChat}>
                                    {`+${props.avatarIcons.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}
                                </Text>
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

RoomHeaderAvatars.defaultProps = defaultProps;
RoomHeaderAvatars.propTypes = propTypes;
RoomHeaderAvatars.displayName = 'RoomHeaderAvatars';

export default memo(RoomHeaderAvatars);
