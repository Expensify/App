import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Avatar from './Avatar';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import avatarPropTypes from './avatarPropTypes';
import UserDetailsTooltip from './UserDetailsTooltip';

const propTypes = {
    /** Avatar URL or icon */
    mainAvatar: avatarPropTypes,

    /** Subscript avatar URL or icon */
    secondaryAvatar: avatarPropTypes,

    /** Set the size of avatars */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Background color used for subscript avatar border */
    backgroundColor: PropTypes.string,

    /** Removes margin from around the avatar, used for the chat view */
    noMargin: PropTypes.bool,
};

const defaultProps = {
    size: CONST.AVATAR_SIZE.DEFAULT,
    backgroundColor: themeColors.componentBG,
    mainAvatar: {},
    secondaryAvatar: {},
    noMargin: false,
};

function SubscriptAvatar(props) {
    const isSmall = props.size === CONST.AVATAR_SIZE.SMALL;
    const subscriptSyle = props.size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.secondAvatarSubscriptSmallNormal : styles.secondAvatarSubscript;
    const containerStyle = isSmall ? styles.emptyAvatarSmall : styles.emptyAvatar;
    // Default the margin style to what is normal for small or normal sized avatars
    let marginStyle = isSmall ? styles.emptyAvatarMarginSmall : styles.emptyAvatarMargin;

    // Some views like the chat view require that there be no margins
    if (props.noMargin) {
        marginStyle = {};
    }
    return (
        <View style={[containerStyle, marginStyle]}>
            <UserDetailsTooltip
                accountID={lodashGet(props.mainAvatar, 'id', -1)}
                icon={props.mainAvatar}
            >
                <View>
                    <Avatar
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(props.size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={props.mainAvatar.source}
                        size={props.size || CONST.AVATAR_SIZE.DEFAULT}
                        name={props.mainAvatar.name}
                        type={props.mainAvatar.type}
                    />
                </View>
            </UserDetailsTooltip>
            <UserDetailsTooltip
                accountID={lodashGet(props.secondaryAvatar, 'id', -1)}
                icon={props.secondaryAvatar}
            >
                <View style={props.size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}}>
                    <Avatar
                        containerStyles={[isSmall ? styles.secondAvatarSubscriptCompact : subscriptSyle]}
                        iconAdditionalStyles={[
                            StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT),
                            StyleUtils.getBorderColorStyle(props.backgroundColor),
                        ]}
                        source={props.secondaryAvatar.source}
                        size={isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT}
                        fill={themeColors.iconSuccessFill}
                        name={props.secondaryAvatar.name}
                        type={props.secondaryAvatar.type}
                    />
                </View>
            </UserDetailsTooltip>
        </View>
    );
}

SubscriptAvatar.displayName = 'SubscriptAvatar';
SubscriptAvatar.propTypes = propTypes;
SubscriptAvatar.defaultProps = defaultProps;
export default memo(SubscriptAvatar);
