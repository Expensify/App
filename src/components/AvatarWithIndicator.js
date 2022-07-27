import _ from 'underscore';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Avatar from './Avatar';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** URL for the avatar */
    source: PropTypes.string.isRequired,

    /** Avatar size */
    size: PropTypes.string,

    /** To show a tooltip on hover */
    tooltipText: PropTypes.string,

    /** The employee list of all policies (coming from Onyx) */
    policiesMemberList: PropTypes.objectOf(PropTypes.object),
};

const defaultProps = {
    size: 'default',
    tooltipText: '',
    policiesMemberList: {},
};

const AvatarWithIndicator = (props) => {
    const indicatorStyles = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        props.size === 'large' ? styles.statusIndicatorLarge : styles.statusIndicator,
    ];
    const isLarge = props.size === 'large';

    // TODO: this is in a utility method
    const hasError = _.some(props.policiesMemberList, policyMembers => _.some(policyMembers, member => !_.isEmpty(member.errors)));
    return (
        <View style={[isLarge ? styles.avatarLarge : styles.sidebarAvatar]}>
            <Tooltip text={props.tooltipText}>
                <Avatar
                    imageStyles={[isLarge ? styles.avatarLarge : null]}
                    source={props.source}
                    size={props.size}
                />
                {hasError && (
                    <View style={StyleSheet.flatten(indicatorStyles)} />
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
