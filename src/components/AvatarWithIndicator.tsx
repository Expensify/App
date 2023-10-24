import React from 'react';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import * as UserUtils from '../libs/UserUtils';
import styles from '../styles/styles';
import Avatar from './Avatar';
import * as Expensicons from './Icon/Expensicons';
import Indicator from './Indicator';
import Tooltip from './Tooltip';

type AvatarWithIndicatorProps = {
    /** URL for the avatar */
    source: string | React.FC<SvgProps>;

    /** To show a tooltip on hover */
    tooltipText?: string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: string | React.FC<SvgProps>;
};

function AvatarWithIndicator({source, tooltipText = '', fallbackIcon = Expensicons.FallbackAvatar}: AvatarWithIndicatorProps) {
    return (
        <Tooltip
            text={tooltipText}
            shouldRender={false}
        >
            <View style={[styles.sidebarAvatar]}>
                <Avatar
                    source={UserUtils.getSmallSizeAvatar(source)}
                    fallbackIcon={fallbackIcon}
                />
                <Indicator />
            </View>
        </Tooltip>
    );
}

AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default AvatarWithIndicator;
