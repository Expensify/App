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
};

const SubscriptAvatar = props => (
    <View style={styles.emptyAvatar}>
        <View>
            <Tooltip text={props.avatarTooltips[0]} absolute>
                <Avatar
                    source={props.avatarImageURLs[0]}
                />
            </Tooltip>
        </View>
        <View
            style={[styles.secondAvatarSubscript, styles.secondAvatarHovered]}
        >
            <Tooltip text={props.avatarTooltips[1]} absolute>
                { props.avatarImageURLs[1] === ''
                    ? (
                        <Icon
                            src={props.defaultSubscriptIcon()}
                            height={variables.iconSizeNormal}
                            width={variables.iconSizeNormal}
                            style={styles.singleSubscript}
                            fill={themedefault.iconSuccessFill}
                        />
                    ) : (
                        <Avatar
                            source={props.avatarImageURLs[1]}
                            imageStyles={[styles.singleSubscript]}
                        />
                    )}
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.propTypes = propTypes;
export default memo(SubscriptAvatar);
