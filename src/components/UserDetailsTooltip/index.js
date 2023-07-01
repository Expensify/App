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
import withLocalize from '../withLocalize';
import compose from '../../libs/compose';
import * as UserUtils from '../../libs/UserUtils';

function UserDetailsTooltip(props) {
    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    let userDisplayName = userDetails.displayName ? userDetails.displayName.trim() : '';
    let userLogin = (userDetails.login || '').trim() && !_.isEqual(userDetails.login, userDetails.displayName) ? Str.removeSMSDomain(userDetails.login) : '';
    let userAvatar = userDetails.avatar;
    let userAccountID = props.accountID;

    // We replace the actor's email, name, and avatar with the Copilot manually for now. This will be improved upon when
    // the Copilot feature is implemented.
    if (props.delegateAccountID) {
        const delegateUserDetails = lodashGet(props.personalDetailsList, props.delegateAccountID, {});
        const delegateUserDisplayName = delegateUserDetails.displayName ? delegateUserDetails.displayName.trim() : '';
        userDisplayName = `${delegateUserDisplayName} (${props.translate('reportAction.asCopilot')} ${userDisplayName})`;
        userLogin = delegateUserDetails.login;
        userAvatar = delegateUserDetails.avatar;
        userAccountID = props.delegateAccountID;
    }

    const renderTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={UserUtils.getAvatar(userAvatar, userAccountID)}
                    />
                </View>

                <Text style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{userDisplayName}</Text>

                <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>
                    {(userLogin || '').trim() && !_.isEqual(userLogin, userDisplayName) ? Str.removeSMSDomain(userLogin) : ''}
                </Text>
            </View>
        ),
        [userAvatar, userDisplayName, userLogin, userAccountID],
    );

    if (!userDisplayName && !userLogin) {
        return props.children;
    }

    return <Tooltip renderTooltipContent={renderTooltipContent}>{props.children}</Tooltip>;
}

UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.defaultProps = defaultProps;
UserDetailsTooltip.displayName = 'UserDetailsTooltip';

export default compose(
    withLocalize,
    withOnyx({
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(UserDetailsTooltip);
