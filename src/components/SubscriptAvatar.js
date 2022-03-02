import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import themeColors from '../styles/themes/default';
import Avatar from './Avatar';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /** Avatar URL or icon */
    mainAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Subscript avatar URL or icon */
    secondaryAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** Tooltip for the main avatar */
    mainTooltip: PropTypes.string,

    /** Tooltip for the subscript avatar */
    secondaryTooltip: PropTypes.string,

    /** Set the size of avatars */
    mode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),
};

const defaultProps = {
    mainTooltip: '',
    secondaryTooltip: '',
    mode: CONST.OPTION_MODE.DEFAULT,
};

const SubscriptAvatar = props => (
    <View style={styles.emptyAvatar}>
        <Tooltip text={props.mainTooltip}>
            <Avatar
                source={props.mainAvatar}
                size={props.mode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
            />
        </Tooltip>
        <View style={[
            props.mode === CONST.OPTION_MODE.COMPACT ? styles.secondAvatarSubscriptCompact : styles.secondAvatarSubscript,
            StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)]}
        >
            <Tooltip text={props.secondaryTooltip}>
                <Avatar
                    source={props.secondaryAvatar}
                    size={props.mode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT}
                    fill={themeColors.iconSuccessFill}
                />
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.displayName = 'SubscriptAvatar';
SubscriptAvatar.propTypes = propTypes;
SubscriptAvatar.defaultProps = defaultProps;
export default memo(SubscriptAvatar);
