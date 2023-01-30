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
};

const defaultProps = {
    icons: [],
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

        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
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
                                        ...iconStyle,
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
