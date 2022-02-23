import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Tooltip from './Tooltip';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const SubscriptAvatar = props => (
    <View style={styles.emptyAvatar}>
        <Tooltip text={props.avatarTooltips[0]} absolute>
            <Image
                source={{uri: props.avatarImageURLs[0]}}
                style={styles.avatarNormal}
            />
        </Tooltip>
        <View
            style={[
                styles.secondAvatarSubscript,
                styles.secondAvatarHovered,
            ]}
        >
            <Tooltip text={props.avatarTooltips[1]} absolute>
                <Image
                    source={{uri: props.avatarImageURLs[1]}}
                    style={styles.singleSubscript}
                />
            </Tooltip>
        </View>
    </View>
);

SubscriptAvatar.propTypes = propTypes;
export default memo(SubscriptAvatar);
