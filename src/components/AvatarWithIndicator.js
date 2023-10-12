import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import * as UserUtils from '../libs/UserUtils';
import Indicator from './Indicator';
import * as Expensicons from './Icon/Expensicons';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};

const defaultProps = {
    tooltipText: '',
    fallbackIcon: Expensicons.FallbackAvatar,
};

function AvatarWithIndicator(props) {
    return (
        <Tooltip text={props.tooltipText}>
            <View style={[styles.sidebarAvatar]}>
                <Avatar
                    source={UserUtils.getSmallSizeAvatar(props.source)}
                    fallbackIcon={props.fallbackIcon}
                />
                <Indicator />
            </View>
        </Tooltip>
    );
}

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default AvatarWithIndicator;
