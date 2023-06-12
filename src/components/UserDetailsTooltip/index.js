import React, {useCallback} from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import {propTypes, defaultProps} from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';

function UserDetailsTooltip(props) {
    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    const renderTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={userDetails.avatar}
                    />
                </View>

                <Text style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>
                    {String(userDetails.displayName).trim() ? userDetails.displayName : ''}
                </Text>

                <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>
                    {String(userDetails.login).trim() && !_.isEqual(userDetails.login, userDetails.displayName) ? Str.removeSMSDomain(userDetails.login) : ''}
                </Text>
            </View>
        ),
        [userDetails.avatar, userDetails.displayName, userDetails.login],
    );

    if (!userDetails.displayName && !userDetails.login) {
        return props.children;
    }

    return <Tooltip renderTooltipContent={renderTooltipContent}>{props.children}</Tooltip>;
}

UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.defaultProps = defaultProps;
UserDetailsTooltip.displayName = 'UserDetailsTooltip';

export default withOnyx({
    personalDetailsList: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(UserDetailsTooltip);
