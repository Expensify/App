import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import themeColors from '../styles/themes/default';
import Avatar from './Avatar';
import CONST from '../CONST';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Default icon if the subscript image is not set */
    defaultSubscriptIcon: PropTypes.func.isRequired,
};

const LargeDualAvatars = props => (
    <View>
        <View style={[styles.secondAvatarHovered, styles.rightSideLargeAvatar]}>
            <Tooltip text={props.avatarTooltips[0]} absolute>
                <Avatar
                    source={props.avatarImageURLs[0]}
                    imageStyles={[styles.avatarLarge]}
                />
            </Tooltip>
        </View>
        <View style={styles.secondAvatarLarge}>
            <Tooltip text={props.avatarTooltips[1]} absolute>
                <Avatar
                    source={props.avatarImageURLs[1] !== '' ? props.avatarImageURLs[1] : props.defaultSubscriptIcon()}
                    imageStyles={[styles.avatarLarge]}
                    size={CONST.AVATAR_SIZE.LARGE}
                    fill={themeColors.iconSuccessFill}
                />
            </Tooltip>
        </View>
    </View>
);

LargeDualAvatars.propTypes = propTypes;
export default memo(LargeDualAvatars);
