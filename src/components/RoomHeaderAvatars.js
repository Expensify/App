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
    icons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    /** Whether show large Avatars */
    shouldShowLargeAvatars: PropTypes.bool,
};

const defaultProps = {
    icons: [],
    shouldShowLargeAvatars: false,
};

const RoomHeaderAvatars = (props) => {
    if (!props.icons.length) {
        return null;
    }

    if (props.icons.length === 1) {
        return (
            <Avatar
                source={props.icons[0]}
                imageStyles={[styles.avatarLarge]}
                fill={themeColors.iconSuccessFill}
                size={CONST.AVATAR_SIZE.LARGE}
            />
        );
    }

    const iconsToDisplay = props.icons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    const iconStyle = [
        styles.roomHeaderAvatar,

        // Because the border is applied to the Avatars when there are multiple they need to be slightly larger to match size
        StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.LARGE_BORDERED),
    ];
    return (
        <View pointerEvents="none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {_.map(iconsToDisplay, (val, index) => (
                    <View key={`${val}${index}`} style={[styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <Image source={{uri: val}} style={iconStyle} />

                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && props.icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                            <>
                                <View
                                    style={[
                                        styles.roomHeaderAvatar,
                                        styles.roomHeaderAvatarOverlay,
                                    ]}
                                />
                                <Text style={styles.avatarInnerTextChat}>
                                    {`+${props.icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}
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
