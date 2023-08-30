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
import * as UserUtils from '../../libs/UserUtils';
import CONST from '../../CONST';
import * as LocalePhoneNumber from '../../libs/LocalePhoneNumber';
import useLocalize from '../../hooks/useLocalize';

function UserDetailsTooltip(props) {
    const {translate} = useLocalize();

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
        userDisplayName = `${delegateUserDisplayName} (${translate('reportAction.asCopilot')} ${userDisplayName})`;
        userLogin = delegateUserDetails.login;
        userAvatar = delegateUserDetails.avatar;
        userAccountID = props.delegateAccountID;
    }

    let title = String(userDisplayName).trim() ? userDisplayName : '';
    const subtitle = (userLogin || '').trim() && !_.isEqual(LocalePhoneNumber.formatPhoneNumber(userLogin || ''), userDisplayName) ? Str.removeSMSDomain(userLogin) : '';
    if (props.icon && (props.icon.type === CONST.ICON_TYPE_WORKSPACE || !title)) {
        title = props.icon.name;
    }
    const renderTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={props.icon ? props.icon.source : UserUtils.getAvatar(userAvatar, userAccountID)}
                        type={props.icon ? props.icon.type : CONST.ICON_TYPE_AVATAR}
                        name={props.icon ? props.icon.name : userLogin}
                    />
                </View>
                <Text style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{title}</Text>
                <Text style={[styles.textMicro, styles.fontColorReactionLabel, styles.breakWord, styles.textAlignCenter]}>{subtitle}</Text>
            </View>
        ),
        [props.icon, userAvatar, userAccountID, userLogin, title, subtitle],
    );

    if (!props.icon && !userDisplayName && !userLogin) {
        return props.children;
    }

    return (
        <Tooltip
            shiftHorizontal={props.shiftHorizontal}
            renderTooltipContent={renderTooltipContent}
            renderTooltipContentKey={[userDisplayName, userLogin]}
        >
            {props.children}
        </Tooltip>
    );
}

UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.defaultProps = defaultProps;
UserDetailsTooltip.displayName = 'UserDetailsTooltip';

export default withOnyx({
    personalDetailsList: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(UserDetailsTooltip);
