import _ from 'underscore';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import ONYXKEYS from '../ONYXKEYS';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import variables from '../styles/variables';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.string.isRequired,

    /** Avatar size */
    size: PropTypes.string,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** The employee list of all policies (coming from Onyx) */
    policiesMemberList: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    size: 'default',
    tooltipText: '',
    policiesMemberList: [],
};

const AvatarWithIndicator = (props) => {
    const indicatorStyles = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.avatarWithIndicator.errorDot,
    ];
    const isLarge = props.size === 'large';
    const hasError = _.chain(props.policiesMemberList).flatten().some(member => !_.isEmpty(member.erros)).value();
    return (
        <View style={[isLarge ? styles.avatarLarge : styles.sidebarAvatar]}>
            <Tooltip text={props.tooltipText}>
                <Avatar
                    imageStyles={[isLarge ? styles.avatarLarge : null]}
                    source={props.source}
                    size={props.size}
                />
                {hasError && (
                    <View style={StyleSheet.flatten(indicatorStyles)}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={colors.red}
                            height={isLarge ? variables.iconSizeSmall : variables.iconSizeLarge}
                            width={isLarge ? variables.iconSizeSmall : variables.iconSizeLarge}
                        />
                    </View>
                )}
            </Tooltip>
        </View>
    );
};

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';

export default withOnyx({
    policiesMemberList: {
        key: ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST,
    },
})(AvatarWithIndicator);
