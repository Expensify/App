import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import themeColors from '../styles/themes/default';
import Avatar from './Avatar';
import CONST from '../CONST';

const propTypes = {
    /** Avatar URL or icon */
    mainAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Subscript avatar URL or icon */
    secondaryAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Tooltip for the main avatar */
    mainTooltip: PropTypes.string,

    /** Tooltip for the subscript avatar */
    secondaryTooltip: PropTypes.string,
};

const defaultProps = {
    mainTooltip: '',
    secondaryTooltip: '',
};

const SubscriptAvatar = props => (
    <View style={styles.emptyAvatar}>
        <Tooltip text={props.mainTooltip}>
            <Avatar
                source={props.mainAvatar}
            />
        </Tooltip>
        <View style={[styles.secondAvatarSubscript, styles.secondAvatarHovered]}>
            <Tooltip text={props.secondaryTooltip}>
                <Avatar
                    source={props.secondaryAvatar}
                    imageStyles={[styles.singleSubscript]}
                    size={CONST.AVATAR_SIZE.SUBSCRIPT}
                    fill={themeColors.iconSuccessFill}
                />
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.propTypes = propTypes;
SubscriptAvatar.defaultProps = defaultProps;
export default memo(SubscriptAvatar);
