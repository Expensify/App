import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import * as UserUtils from '../libs/UserUtils';
import Indicator from './Indicator';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,
};

const defaultProps = {
    tooltipText: '',
};

function AvatarWithIndicator(props) {
    return (
        <Tooltip text={props.tooltipText}>
            <View style={[styles.sidebarAvatar]}>
                <Avatar source={UserUtils.getSmallSizeAvatar(props.source)} />
                <Indicator />
            </View>
        </Tooltip>
    );
}

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default AvatarWithIndicator;
