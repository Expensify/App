import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import Icon from './Icon';
import themedefault from '../styles/themes/default';
import Avatar from './Avatar';

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
    <View style={props.size === 'large' ? styles.emptyAvatarLarge : styles.emptyAvatar}>
        <Tooltip text={props.avatarTooltips[0]} absolute>
            <Avatar
                source={props.avatarImageURLs[0]}
                imageStyles={[props.size === 'large' ? styles.avatarLarge : null]}
            />
        </Tooltip>
        <View
            style={[
                styles.secondAvatarSubscript,
                styles.secondAvatarHovered,
            ]}
        >
            <Tooltip text={props.avatarTooltips[1]} absolute>
                { props.avatarImageURLs[1] === ''
                    ? (
                        <Icon
                            src={props.defaultSubscriptIcon()}
                            style={styles.singleSubscript}
                            fill={themedefault.iconSuccessFill}
                        />
                    ) : (
                        <Image
                            source={{uri: props.avatarImageURLs[1]}}
                            style={styles.singleSubscript}
                        />
                    )}
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.defaultProps = defaultProps;
SubscriptAvatar.propTypes = propTypes;
export default memo(SubscriptAvatar);
