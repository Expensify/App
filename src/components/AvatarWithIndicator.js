import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import Text from './Text';
import * as UserUtils from '../libs/UserUtils';
import Indicator from './Indicator';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** Persons emojy status */
    emojiStatus: PropTypes.string,
};

const defaultProps = {
    tooltipText: '',
    emojiStatus: '',
};

function AvatarWithIndicator({tooltipText, emojiStatus, source}) {
    return (
        <Tooltip text={tooltipText}>
            <View style={!!emojiStatus && styles.sidebarStatusAvatarContainer}>
                {!!emojiStatus && (
                    <View style={styles.sidebarStatusAvatar}>
                        <Text
                            style={styles.emojiStatusLHN}
                            numberOfLines={1}
                        >
                            {emojiStatus}
                        </Text>
                    </View>
                )}
                <View style={[styles.sidebarAvatar]}>
                    <Avatar source={UserUtils.getSmallSizeAvatar(source)} />
                    <Indicator />
                </View>
            </View>
        </Tooltip>
    );
}

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default AvatarWithIndicator;
