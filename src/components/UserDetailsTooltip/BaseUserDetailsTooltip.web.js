import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Avatar from '@components/Avatar';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './userDetailsTooltipPropTypes';

function BaseUserDetailsTooltip(props) {
    const {translate} = useLocalize();

    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    let userDisplayName = ReportUtils.getDisplayNameForParticipant(props.accountID);
    let userLogin = (userDetails.login || '').trim() && !_.isEqual(userDetails.login, userDetails.displayName) ? Str.removeSMSDomain(userDetails.login) : '';
    let userAvatar = userDetails.avatar;
    let userAccountID = props.accountID;

    // We replace the actor's email, name, and avatar with the Copilot manually for now. This will be improved upon when
    // the Copilot feature is implemented.
    if (props.delegateAccountID) {
        const delegateUserDetails = lodashGet(props.personalDetailsList, props.delegateAccountID, {});
        const delegateUserDisplayName = ReportUtils.getDisplayNameForParticipant(props.delegateAccountID);
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
                        fallbackIcon={lodashGet(props.icon, 'fallbackIcon')}
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
            shouldHandleScroll
        >
            {props.children}
        </Tooltip>
    );
}

BaseUserDetailsTooltip.propTypes = propTypes;
BaseUserDetailsTooltip.defaultProps = defaultProps;
BaseUserDetailsTooltip.displayName = 'BaseUserDetailsTooltip';

export default withOnyx({
    personalDetailsList: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(BaseUserDetailsTooltip);
