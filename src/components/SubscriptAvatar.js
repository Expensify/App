import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import Icon from './Icon';
import themedefault from '../styles/themes/default';
import Avatar from './Avatar';
import variables from '../styles/variables';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Default icon if the subscript image is not set */
    defaultSubscriptIcon: PropTypes.func.isRequired,

    /** Set the sie of avatars */
    size: PropTypes.oneOf(['default', 'large']),
};

const defaultProps = {
    size: 'default',
};

const SubscriptAvatar = props => (
    <View style={props.size === 'large' ? {} : styles.emptyAvatar}>
        <View style={props.size === 'large' ? [styles.secondAvatarHovered, styles.rightSideLargeAvatar] : []}>
            <Tooltip text={props.avatarTooltips[0]} absolute>
                <Avatar
                    source={props.avatarImageURLs[0]}
                    imageStyles={props.size === 'large' ? [styles.avatarLarge] : []}
                />
            </Tooltip>
        </View>
        <View
            style={
                props.size === 'large' ? styles.secondAvatarLarge : [styles.secondAvatarSubscript, styles.secondAvatarHovered]
            }
        >
            <Tooltip text={props.avatarTooltips[1]} absolute>
                { props.avatarImageURLs[1] === ''
                    ? (
                        <Icon
                            src={props.defaultSubscriptIcon()}
                            height={props.size === 'large' ? variables.avatarSizeLarge : variables.iconSizeNormal}
                            width={props.size === 'large' ? variables.avatarSizeLarge : variables.iconSizeNormal}
                            style={styles.singleSubscript}
                            fill={themedefault.iconSuccessFill}
                        />
                    ) : (
                        <Avatar
                            source={props.avatarImageURLs[1]}
                            imageStyles={[props.size === 'large' ? styles.avatarLarge : styles.singleSubscript]}
                        />
                    )}
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.defaultProps = defaultProps;
SubscriptAvatar.propTypes = propTypes;
export default memo(SubscriptAvatar);
