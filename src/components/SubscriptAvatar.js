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
import avatarPropTypes from './avatarPropTypes';

const propTypes = {
    /** Avatar URL or icon */
    mainAvatar: avatarPropTypes,

    /** Subscript avatar URL or icon */
    secondaryAvatar: avatarPropTypes,

    /** Tooltip for the main avatar */
    mainTooltip: PropTypes.string,

    /** Tooltip for the subscript avatar */
    secondaryTooltip: PropTypes.string,

    /** Set the size of avatars */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Background color used for subscript avatar border */
    backgroundColor: PropTypes.string,
};

const defaultProps = {
    mainTooltip: '',
    secondaryTooltip: '',
    size: CONST.AVATAR_SIZE.DEFAULT,
    backgroundColor: themeColors.componentBG,
    mainAvatar: {},
    secondaryAvatar: {},
};

const SubscriptAvatar = props => (
    <View style={props.size === CONST.AVATAR_SIZE.SMALL ? styles.emptyAvatarSmall : styles.emptyAvatar}>
        <Tooltip text={props.mainTooltip}>
            <Avatar
                source={props.mainAvatar.source}
                size={props.size === CONST.AVATAR_SIZE.SMALL ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                name={props.mainAvatar.name}
                type={props.mainAvatar.type}
            />
        </Tooltip>
        <View style={[
            props.size === CONST.AVATAR_SIZE.SMALL ? styles.secondAvatarSubscriptCompact : styles.secondAvatarSubscript,
            StyleUtils.getBackgroundAndBorderStyle(props.backgroundColor),
            StyleUtils.getAvatarBorderStyle(props.size, props.secondaryAvatar.type),
        ]}
        >
            <Tooltip text={props.secondaryTooltip}>
                <Avatar
                    source={props.secondaryAvatar.source}
                    size={props.size === CONST.AVATAR_SIZE.SMALL ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT}
                    fill={themeColors.iconSuccessFill}
                    name={props.secondaryAvatar.name}
                    type={props.secondaryAvatar.type}
                />
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.displayName = 'SubscriptAvatar';
SubscriptAvatar.propTypes = propTypes;
SubscriptAvatar.defaultProps = defaultProps;
export default memo(SubscriptAvatar);
