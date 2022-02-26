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
    avatarIcons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])).isRequired,

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Default icon if the subscript image is not set */
    defaultSubscriptIcon: PropTypes.func.isRequired,
};

const SubscriptAvatar = props => (
    <View style={styles.emptyAvatar}>
        <View>
            <Tooltip text={props.avatarTooltips[0]} absolute>
                <Avatar
                    source={props.avatarIcons[0]}
                />
            </Tooltip>
        </View>
        <View
            style={[styles.secondAvatarSubscript, styles.secondAvatarHovered]}
        >
            <Tooltip text={props.avatarTooltips[1]} absolute>
                <Avatar
                    source={props.avatarIcons[1] !== '' ? props.avatarIcons[1] : props.defaultSubscriptIcon()}
                    imageStyles={[styles.singleSubscript]}
                    size={CONST.AVATAR_SIZE.SUBSCRIPT}
                    fill={themeColors.iconSuccessFill}
                />
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.propTypes = propTypes;
export default memo(SubscriptAvatar);
